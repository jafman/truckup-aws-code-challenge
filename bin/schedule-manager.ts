#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ScheduleManagerStack } from '../lib/schedule-manager-stack';

const app = new cdk.App();
new ScheduleManagerStack(app, 'ScheduleManagerStack');
