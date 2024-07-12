import { Duration, Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Database } from './database';


export class ScheduleManagerStack extends Stack {

  private readonly lambdaRuntime: lambda.Runtime;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.lambdaRuntime = lambda.Runtime.NODEJS_16_X;

    const dlq = new sqs.Queue(this, 'DeadLetterQueue', {
      visibilityTimeout: Duration.seconds(700),
    });

    const queue = new sqs.Queue(this, 'ScheduleManagerQueue', {
      visibilityTimeout: Duration.seconds(700),
      deadLetterQueue: {
        maxReceiveCount: 10,
        queue: dlq,
      },
      redriveAllowPolicy: {
        redrivePermission: sqs.RedrivePermission.DENY_ALL,
      }
    });

    const bucket = new s3.Bucket(this, 'sheduleMgrS3Bucket', {
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const auroraPostgres = new Database(this, 'AuororaPostgres', {})

    const environment = {
      DB_SECRETS_STORE_ARN: auroraPostgres.secretArn,
      DB_AURORA_CLUSTER_ARN: auroraPostgres.clusterArn,
      DATABASE_NAME: auroraPostgres.databaseName,
    }

    const getUserSchedule = new lambda.Function(this, 'GetUserScheduleHandler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.getUserSchedule',
      timeout: Duration.minutes(3),
      environment,
    })

    const updateSchedule = new lambda.Function(this, 'UpdateUserScheduleHandler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.updateSchedule',
      timeout: Duration.minutes(3),
      environment: { 
        ...environment,
        QUEUE_URL: queue.queueUrl,
      }
    })

    const deleteSchedule = new lambda.Function(this, 'DeleteUserScheduleHandler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.deleteSchedule',
      timeout: Duration.minutes(3),
      environment,
    })

    const createUserSchedule = new lambda.Function(this, 'CreateUserScheduleHandler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.createSchedule',
      timeout: Duration.minutes(3),
      environment,
    })

    const defaultHandler = new lambda.Function(this, 'DefaultHandler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.defaultHandler',
      timeout: Duration.minutes(3),
    })

    const databaseSeed = new lambda.Function(this, 'DBSeeder', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'db.seed',
      timeout: Duration.minutes(3),
      environment,
    })

    const s3Handler = new lambda.Function(this, 'S3Handler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 's3.handler',
      timeout: Duration.minutes(10),
      environment: {
        QUEUE_URL: queue.queueUrl,
        BUCKET_NAME: bucket.bucketName,
      }
    })

    auroraPostgres.grantDataAPIAccess(createUserSchedule);
    auroraPostgres.grantDataAPIAccess(databaseSeed);
    auroraPostgres.grantDataAPIAccess(getUserSchedule);
    auroraPostgres.grantDataAPIAccess(updateSchedule);
    auroraPostgres.grantDataAPIAccess(deleteSchedule);

    const apiGateway = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: defaultHandler,
      proxy: false,
      defaultMethodOptions: {
        apiKeyRequired: false
      }
    });

    const user = apiGateway.root.addResource('user').addResource('schedule');
    user.addMethod('GET', new apigw.LambdaIntegration(getUserSchedule));

    const seed = apiGateway.root.addResource('seed');
    seed.addMethod('GET', new apigw.LambdaIntegration(databaseSeed));

    user.addMethod('POST', new apigw.LambdaIntegration(createUserSchedule));
    user.addMethod('PATCH', new apigw.LambdaIntegration(updateSchedule));
    user.addMethod('DELETE', new apigw.LambdaIntegration(deleteSchedule));

    queue.grantConsumeMessages(s3Handler);
    queue.grantSendMessages(updateSchedule);
    bucket.grantReadWrite(s3Handler);

    s3Handler.addEventSource(new SqsEventSource(queue, {
      batchSize: 5,
      maxConcurrency: 10,
    }))

  }
}
