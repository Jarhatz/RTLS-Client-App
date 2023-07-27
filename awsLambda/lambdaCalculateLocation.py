import boto3
import json

db = boto3.client('dynamodb')


def lambda_handler(event, context):
    # print("Event Records: ")
    # print(event['Records'][0]['dynamodb'])

    tags_map = create_tags_map()

    for tag in tags_map.keys():
        calculate_location(tag, tags_map[tag])

    return {
        'statusCode': 200,
        'body': json.dumps('Location Calculated Successfully...')
    }


def create_tags_map():
    tags_map = {}

    response = db.scan(TableName='sites_1_gw_tags')
    items = response['Items']
    for item in items:
        tag_name = item['tag_mac']['S']
        anchor_rssi = (item['gw_id']['S'], int(item['rssi']['N']) * -1)
        if tag_name in tags_map.keys():
            tags_map[tag_name].append(anchor_rssi)
        else:
            tags_map[tag_name] = [anchor_rssi]

    return tags_map


def calculate_location(tag_mac, anchor_rssi_list):
    dist_coords = []
    min_dist = None
    nearest_anchor = None
    site_num = anchor_rssi_list[0][0].split('_')[1]
    for anchor_id, rssi in anchor_rssi_list[:3]:
        siteResp = db.get_item(
            TableName='sites',
            Key={
                'site_id': {'S': site_num}
            },
            ProjectionExpression='pixels_per_foot'
        )
        distance = ((0.0218 * rssi**2 - 2.0084 * rssi + 46.9001)
                    * int(siteResp['Item']['pixels_per_foot']['S']))

        anchorResp = db.get_item(
            TableName='sites_' + site_num + '_anchors',
            Key={
                'anchor_id': {'S': anchor_id}
            },
            ProjectionExpression='anchor_name, coordinates'
        )
        anchor_coords = (float(anchorResp['Item']['coordinates']['L'][0]['S']),
                         float(anchorResp['Item']['coordinates']['L'][1]['S']))
        dist_coords.append((distance, anchor_coords))

        if not min_dist:
            min_dist = distance
            nearest_anchor = anchorResp['Item']['anchor_name']['S']
        elif min_dist > distance:
            min_dist = distance
            nearest_anchor = anchorResp['Item']['anchor_name']['S']

    tag_x, tag_y = trilaterate(dist_coords)

    tagResp = db.get_item(
        TableName='sites_' + site_num + '_tags',
        Key={
            'tag_id': {'S': 'SITE_' + site_num + '_TAG_' + tag_mac[-4:]}
        },
        ProjectionExpression='user_name'
    )
    username = tagResp['Item']['user_name']['S']

    userResp = db.update_item(
        TableName='sites_' + site_num + '_users',
        Key={
            'user_name': {'S': username}
        },
        UpdateExpression='SET #attr1 = :val1',
        ExpressionAttributeNames={
            '#attr1': 'location'
        },
        ExpressionAttributeValues={
            ':val1': {'L': [{'S': nearest_anchor}, {'S': str(tag_x)}, {'S': str(tag_y)}]}
        }
    )


def trilaterate(dist_coords):
    # Calculate the intermediate values
    a = 2 * (dist_coords[1][1][0] - dist_coords[0][1][0])
    b = 2 * (dist_coords[1][1][1] - dist_coords[0][1][1])
    c = dist_coords[0][0]**2 - dist_coords[1][0]**2 - dist_coords[0][1][0]**2 + \
        dist_coords[1][1][0]**2 - \
        dist_coords[0][1][1]**2 + dist_coords[1][1][1]
    d = 2 * (dist_coords[2][1][0] - dist_coords[1][1][0])
    e = 2 * (dist_coords[2][1][1] - dist_coords[1][1][1])
    f = dist_coords[1][0]**2 - dist_coords[2][0]**2 - dist_coords[1][1][0]**2 + \
        dist_coords[2][1][0]**2 - \
        dist_coords[1][1][1]**2 + dist_coords[2][1][1]**2

    # Calculate the tag's coordinates
    x = (c*e - f*b) / (e*a - b*d)
    y = (c*d - a*f) / (b*d - a*e)
    return round(x), round(y)
