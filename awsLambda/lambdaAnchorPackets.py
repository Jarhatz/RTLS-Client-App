import boto3

db = boto3.client('dynamodb')


def lambda_handler(event, context):
    for packet in event['data']:
        if packet['value']['type'] == 'Moko BeaconX Pro-ACC':
            gw_id = event['device_info']['device_id']
            siteNum = str(gw_id[5])
            siteStr = "sites_" + siteNum + "_"
            tag_mac = packet['value']['mac']
            tag_id = "SITE_" + siteNum + "_TAG_" + tag_mac[-4:]

            if is_gateway_discovered(siteStr, gw_id):
                update_data(siteStr, gw_id, tag_id, packet)
            else:
                add_data(siteStr, gw_id, tag_id, packet)
                if not is_tag_discovered(siteStr, tag_id):
                    response = db.put_item(
                        TableName=siteStr + 'tags',
                        Item={
                            'tag_id': {'S': tag_id},
                            'mac': {'S': tag_mac},
                            'username': {'S': ""},
                        }
                    )
    return 0


def update_data(site, gw_id, tag_id, packet):
    resp = db.update_item(
        TableName=site + 'gw_tags',
        Key={
            'gw_id': {'S': gw_id},
            'tag_mac': {'S': packet['value']['mac']}
        },
        UpdateExpression='SET #attr1 = :val1, #attr2 = :val2, #attr3 = :val3, #attr4 = :val4, #attr5 = :val5, #attr6 = :val6, #attr7 = :val7, #attr8 = :val8, #attr9 = :val9',
        ExpressionAttributeNames={
            '#attr1': 'timestamp',
            '#attr2': 'rssi',
            '#attr3': 'tx_power',
            '#attr4': 'battery_voltage',
            '#attr5': 'datarate',
            '#attr6': 'scale',
            '#attr7': 'acc_X',
            '#attr8': 'acc_Y',
            '#attr9': 'acc_Z'
        },
        ExpressionAttributeValues={
            ':val1': {'S': parse_timestamp(packet['value']['timestamp'])},
            ':val2': {'N': str(packet['value']['rssi'])},
            ':val3': {'N': str(packet['value']['tx_power'])},
            ':val4': {'N': str(packet['value']['battery_voltage'])},
            ':val5': {'N': str(packet['value']['datarate'])},
            ':val6': {'S': packet['value']['scale']},
            ':val7': {'N': str(packet['value']['3-axisdata-X'])},
            ':val8': {'N': str(packet['value']['3-axisdata-Y'])},
            ':val9': {'N': str(packet['value']['3-axisdata-Z'])}
        }
    )
    update_battery(site, tag_id, packet)


def add_data(site, gw_id, tag_id, packet):
    resp = db.put_item(
        TableName=site + 'gw_tags',
        Item={
            'gw_id': {'S': gw_id},
            'tag_mac': {'S': packet['value']['mac']},
            'timestamp': {'S': parse_timestamp(packet['value']['timestamp'])},
            'rssi': {'N': str(packet['value']['rssi'])},
            'tx_power': {'N': str(packet['value']['tx_power'])},
            'battery_voltage': {'N': str(packet['value']['battery_voltage'])},
            'datarate': {'N': str(packet['value']['datarate'])},
            'scale': {'S': packet['value']['scale']},
            'acc_X': {'N': str(packet['value']['3-axisdata-X'])},
            'acc_Y': {'N': str(packet['value']['3-axisdata-Y'])},
            'acc_Z': {'N': str(packet['value']['3-axisdata-Z'])}
        }
    )
    update_battery(site, tag_id, packet)


def update_battery(site, tag_id, packet):
    tagResp = db.get_item(
        TableName=site + 'tags',
        Key={
            'tag_id': {'S': tag_id}
        },
        ProjectionExpression='user_name'
    )
    username = tagResp['Item']['user_name']['S']
    if not username == "":
        userResp = db.update_item(
            TableName=site + 'users',
            Key={
                'user_name': {'S': username},
            },
            UpdateExpression='SET #attr1 = :val1',
            ExpressionAttributeNames={
                '#attr1': 'battery'
            },
            ExpressionAttributeValues={
                ':val1': {'S': calculate_battery_percentage(str(packet['value']['battery_voltage']))}
            }
        )


def is_gateway_discovered(site, gw_id):
    response = db.query(
        TableName=site + 'gw_tags',
        KeyConditionExpression='#pk = :pk',
        ExpressionAttributeNames={
            '#pk': 'gw_id'
        },
        ExpressionAttributeValues={
            ':pk': {'S': gw_id}
        },
        Select='COUNT'
    )
    return response.get('Count', 0) > 0


def is_tag_discovered(site, tag_id):
    response = db.get_item(
        TableName=site + 'tags',
        Key={
            'tag_id': {'S': tag_id}
        },
        ProjectionExpression='tag_id'
    )
    return 'Item' in response


def parse_timestamp(raw):  # 2023-04-23-4-14 02:27:06
    year = raw[: 4]

    month_sep = raw.find('-', 5)
    month = raw[5: month_sep]
    if len(month) == 1:
        month = "0" + month

    day_sep = raw.find('&')
    day = raw[month_sep + 1: day_sep]
    if len(day) == 1:
        day = "0" + day

    hour_sep = raw.find(':')
    hour = raw[day_sep + 1: hour_sep]
    if len(hour) == 1:
        hour = "0" + hour

    min_sep = raw.find(':', hour_sep + 1)
    minute = raw[hour_sep + 1: min_sep]
    if len(minute) == 1:
        minute = "0" + minute

    sec_sep = raw.find('+')
    second = raw[min_sep + 1: sec_sep]
    if len(second) == 1:
        second = "0" + second

    return f'{year}-{month}-{day} {hour}:{minute}:{second}'


def calculate_battery_percentage(batteryVoltage):
    voltage = batteryVoltage[0] + "." + batteryVoltage[1:]
    voltage = float(voltage)
    return str(int(198.9 * voltage - 501.3)) + "%"
