import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Database } from './database';


export class ScheduleManagerStack extends Stack {

  private readonly lambdaRuntime: lambda.Runtime;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    this.lambdaRuntime = lambda.Runtime.NODEJS_16_X;
    // const queue = new sqs.Queue(this, 'ScheduleManagerQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });

    // const topic = new sns.Topic(this, 'ScheduleManagerTopic');

    // topic.addSubscription(new subs.SqsSubscription(queue));
    const getUserSchedule = new lambda.Function(this, 'GetUserScheduleHandler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.getUserSchedule',
    })

    const defaultHandler = new lambda.Function(this, 'DefaultHandler', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.defaultHandler',
    })

    const auroraPostgres = new Database(this, 'AuororaPostgres', {})

    const databaseSeed = new lambda.Function(this, 'DBSeeder', {
      runtime: this.lambdaRuntime,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'db.seed',
      timeout: Duration.minutes(1),
      environment: {
        DB_SECRETS_STORE_ARN: auroraPostgres.secretArn,
        DB_AURORA_CLUSTER_ARN: auroraPostgres.clusterArn,
        DATABASE_NAME: auroraPostgres.databaseName,
      }
    })

    auroraPostgres.grantDataAPIAccess(databaseSeed);

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

  }
}
