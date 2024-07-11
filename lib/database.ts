import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface DatabaseProps {
}

export class Database extends Construct {
  public readonly clusterArn: string;
  public readonly secretArn: string;
  public readonly databaseName: string;
  public grantDataAPIAccess;
  constructor (scope: Construct, id: string, props: DatabaseProps) {
    super(scope, id);

    const secret = new secretsmanager.Secret(this, 'dbSecret', {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'aurora_admin' }),
        includeSpace: false,
        excludePunctuation: true,
        generateStringKey: 'password',
      }
    })

    this.databaseName = 'schedulemgr';

    const cluster = new rds.ServerlessCluster(this, 'AuroraPostgreDB', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_13_12,
      }),
      credentials: rds.Credentials.fromSecret(secret),
      clusterIdentifier: 'schedule-mgr-db-cluster',
      defaultDatabaseName: this.databaseName,
      enableDataApi: true,
      scaling: { 
        minCapacity: rds.AuroraCapacityUnit.ACU_2,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    this.clusterArn = cluster.clusterArn;
    this.secretArn = secret.secretArn;

    this.grantDataAPIAccess = function (lambdaFn: lambda.IFunction) {
      cluster.grantDataApiAccess(lambdaFn);
    }
  }
}
