Real time location service app using IoT BLE gateways with AWS IoT, Lambda, DynamoDB backend. frontend: React Native Expo iOS/Anrdoid
## Inspiration

In senior care centers, the heartbreaking implications of dementia and Alzheimer's cast a dark shadow over the lives of residents and their families. These cruel neurological disorders rob individuals of their cherished memories, erasing their identities and leaving them bewildered in a confusing world. Simple tasks become insurmountable challenges, and the emotional toll on both patients and caregivers is immeasurable.

Numerous facilities lack affordable resources and an adequate number of staff to consistently monitor and track dementia patients, which can result in alarming situations when they are left unsupervised.
## What it does

This RTLS solution primarily involves two distinct IoT hardware devices.

> Tags
	: small, wearable BLE devices which are programmed to transmit information such as RSSI, accelerometer data, and device information in small intermittent packets.

> Anchors
	: stationary BLE gateways which are actively receiving transmitted packets from Tags and publishing data to the Cloud.

Imagine a network of these anchors plugged into electrical outlets all throughout a facility. They are all collecting the "Received Signal Strength Indicator" (RSSI) values from broadcasting Tags in the area. These RSSI values can be used to triangulate the approximate location of the Tag using trilateration.

Each Tag also has a press-able button in the center which serves to set the Tag in 'SOS' mode. The anchors transmit a packet to the AWS Database with an alert for the respective Tag. For the target user, such as a caretaker or an overseer of a facility, the iOS app clearly allows them to monitor the whereabouts and well-beings of all residents who are wearing tags. The app has real-time updates for when a user cannot be found within the facility.
## How I built it

The first portion of this project was understanding the project architecture and planning the structure of this Software Service Model. Below is a diagram representing the structure of this project's architecture.
After researching [MokoSmart Technology's](https://www.mokosmart.com/) MK107 Pro BLE Gateway and the W6 Wristband Beacon's firmware, I created a script to automatically flash and lock my own configurations to the firmware to all nearby MOKO devices in the area. These configurations included the MQTT broker endpoint, subscription and publishing channels, Wi-Fi settings, security certification files, and much more. These anchors could be plugged into 110 V electrical outlets in the wall and they will immediately start publishing data over to AWS through the MQTT Broker once connected to the local WiFi.

The tags were also configured with the content of the packets and an advertising rate of 10 second time intervals. The two of these devices run in tandem simultaneously either transmitting or receiving packets to their respective destinations.

As for the software of this project, this was a full-stack development project where the I decided to use the popular React Native framework due to it being convenient for package management and a professional option for UI/UX. For the back-end, I was relying on 3 primary services from AWS: IoT Core, Lambda, S3, and DynamoDB (for the tabular data storage).
#### Front-End
The app starts with a sign-in page before the home screen is accessible. Here, the user can either enter a unique site code which is a 6 digit code for a respective facility. They can also scan a QR code which will allow them to enter the site.
Once logged in, the Home Screen will be the new landing page. This is where all users will be listed along with their associated Tags. Information such as battery life percentage, location, and SOS alerts can be seen on this page.
The Map tab allows you to visually monitor the location of a user wearing a Tag within the floor plan of the facility. In the below example, the (X, Y) location is mapped to pixel points in the map component on the front-end.
The anchor tab lists all active anchors in the site. Their locations and statuses can be seen and edited by the user.
#### Back-End
The back-end starts with AWS IoT Core as the component responsible for handling message routing and the receival of packet information from the anchors. The MQTT Client Test Broker allows strict monitoring of  received and sent information from AWS.

AWS Lambda not only serves as a computation component for the database but also serves as a powerful pipeline to clean and parse raw JSON data before updating information in the AWS DynamoDB tables. After the incoming packets are routed from IoT Core, the fields are mapped into tables. AWS Lambda also is responsible for the Cloud computing requirement of this project, triangulation. Using a polynomial regression which I developed by measuring and recording the RSSI values of Tags at different distance values in feet, a formula was devised to convert RSSI to distance. This can be seen in the chart and data below:

## Challenges I ran into

There was very little documentation on the hardware devices from MOKO. It took me some reading and testing to fully understand the GATT Bluetooth Communication Protocol for the firmware of the Anchors and the Tags. Once I figured this out, writing the Mass Configuration Script became manageable.

On the front-end, I had a lot of trouble developing a Zoom-able/Pan-able native Map component which is synced with AWS's DynamoDB tables. The location of the user needs to move and update on the component without having to refresh the screen. Additionally, scaling the location coordinates to whatever zoom level and pan level the component is currently required doing some calculations first. This was most definitely the hardest challenge I ran into during the development stage of this project. 
## What I Learned

I gained a newfound, thorough understanding of database management and data manipulation from the ground-up leveraging AWS DynamoDB. I set up the database to dynamically associate incoming packets to their respective tables without ever voiding information from any packet all while maintaining the structure of the DB's partition and sort keys. Additionally, using AWS Lambda to run computations and pipeline data from the database with Cloud computing is a major accomplishment that I am proud of. I learned of the capabilities of AWS Lambda with triangulating the locations of each Tag recorded in the database using RSSI values. 
## What's next for Real-Time Location Services via Low Energy Bluetooth

This project is very large and has a lot of edge cases needing to be worked out and developed. As the future stands, RTLS via BLE undoubtedly has usability in real-world senior living centers and/or hospitals. I would love to release this as a production build and begin a new venture with this idea its concepts. 
