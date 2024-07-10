import { Duration, Stack, StackProps } from 'aws-cdk-lib';
// import * as sns from 'aws-cdk-lib/aws-sns';
// import * as subs from 'aws-cdk-lib/aws-sns-subscriptions';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

export class ScheduleManagerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // const queue = new sqs.Queue(this, 'ScheduleManagerQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });

    // const topic = new sns.Topic(this, 'ScheduleManagerTopic');

    // topic.addSubscription(new subs.SqsSubscription(queue));
    const getUserSchedule = new lambda.Function(this, 'GetUserScheduleHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.getUserSchedule',
    })

    const defaultHandler = new lambda.Function(this, 'DefaultHandler', {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset('lambda'),
      handler: 'shedule-manager.defaultHandler',
    })

    const apiGateway = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: defaultHandler,
      proxy: false,
      defaultMethodOptions: {
        apiKeyRequired: false
      }
    });

    const user = apiGateway.root.addResource('user').addResource('schedule');
    user.addMethod('GET', new apigw.LambdaIntegration(getUserSchedule));

  }
}
