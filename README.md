# AWS Code Challenge 

## Objective

To Build a serverless application using AWS services that process and store a user’s schedule configuration. 

## Project Setup
- Clone this repo
- Install `AWS CDK CLI` by running this command: `npm i -g aws-cdk`
- Install all packages by running `npm i` 
- If its your first time of deploying infrastructure to you AWS environment using `CDK`, you need to boostrap the environment by running this comman: `cdk bootstrap`. Bootstrapping prepares your AWS environment by provisioning specific AWS resources in your environment that are used by the AWS CDK.
- Run `cdk synth` to emit the synthesized cloud formation template. 
- Run `cdk deploy` to deploy infrastructure 
- After a succssful deploy, there is an endpoint `GET {{baseurl}}/seed
` you can use to seed the database. This ensures required tables are created in the DB. See API documentation below for mor info.
## API Documentation 
[Postman Documentation Link](https://documenter.getpostman.com/view/25402050/2sA3e5cnmL)

### 1. Create Schedule

Endpoint to create a schedule for a user.

- **URL**

  `POST {{baseurl}}/user/schedule`

- **Body**

  ```json
  {
      "day": "tuesday",
      "start_time": "11:00 AM",
      "end_time": "12:00 PM"
  }

- **Response**
- 200 OK
    ```json
    {
        "message": "Hurray! schedule created"
    }
- 400 Bad Request - Overlap Error
    ```json
    {
        "error": "Invalid time range, an overlap exist, between 02:00 PM and 03:30 PM"
    }
---

### 2. Get User Schedule

Endpoint to get weekly schedule of a user.

- **URL**

  `GET {{baseurl}}/user/schedule`


- **Response**
- 200 OK
    ```json
    {
        "userId": "2e2d69d4-b11f-4162-9aaf-dece541bccd7",
        "schedule": {
            "monday": [
                {
                    "id": 1,
                    "start_time": "07:00 AM",
                    "end_time": "07:30 AM"
                },
                {
                    "id": 2,
                    "start_time": "02:00 PM",
                    "end_time": "03:30 PM"
                }
            ],
            "tuesday": [
                {
                    "id": 35,
                    "start_time": "02:00 PM",
                    "end_time": "03:30 PM"
                }
            ]
        }
    }
---
### 3. Update Schedule

Endpoint to update a user's schedule.

- **URL**

  `PATCH {{baseurl}}/user/schedule`

- **Body**

  ```json
  {
    "id": 1,
    "start_time": "07:00 am",
    "end_time": "07:30 am"
  }

- **Response**
- 200 OK
    ```json
    {
        "message": "update operation successful"
    }
---
### 4. Delete Schedule

Endpoint to delete a schedule.

- **URL**

  `DELETE {{baseurl}}/user/schedule`

- **Body**

  ```json
  {
    "id": 34
  }


- **Response**
- 200 OK
    ```json
    {
        "message": "delete operation successful"
    }
---

### 5. Get User's Status

Endpoint to calculate the online status at several different timestamps.

- **URL**

  `GET {{baseurl}}/user/schedule/status/?day=monday&time=7:00pM`

- **Response**
- 200 OK (Online)
    ```json
    {
        "userId": "2e2d69d4-b11f-4162-9aaf-dece541bccd7",
        "time": "7:00 PM",
        "day": "monday",
        "status": "Online"
    }
- 200 OK (Offline)
    ```json
    {
        "userId": "2e2d69d4-b11f-4162-9aaf-dece541bccd7",
        "time": "3:30 PM",
        "day": "monday",
        "status": "Offline"
    }
---
### 6. Seed DB

Endpoint to seed the Auorora PostgreSQL Database.

- **URL**

  `GET {{baseurl}}/seed`