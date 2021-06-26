#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { name, version, author } from '../../package.json'

import { requiredEnv, fromEnv, ifEmtpy } from './lib/utils'
import { InfraStack, WafStack, ServiceStack } from './stacks'

const environment = requiredEnv('ENVIRONMENT')
const region = requiredEnv('AWS_REGION')
const cloudfrontRegion = 'us-east-1'

const configFromEnv = fromEnv({
  application: 'APPLICATION',
  createdBy: 'CREATED_BY',
  version: 'VERSION',
})

const commonParams = {
  environment,
  application: ifEmtpy(configFromEnv.application, name),
  version: ifEmtpy(configFromEnv.version, version),
  createdBy: ifEmtpy(configFromEnv.createdBy, author),
}

const app = new cdk.App()

const infraStack = new InfraStack(app, `${environment}-custom-resource`, {
  env: {
    region,
  },
  ...commonParams,
})

const wafStack = new WafStack(app, `${environment}-${configFromEnv.application}-waf`, {
  env: {
    region: cloudfrontRegion,
  },
  ...commonParams,
  scope: 'CLOUDFRONT',
})

const serviceStack = new ServiceStack(app, `${environment}-${configFromEnv.application}-service`, {
  env: {
    region,
  },
  ...commonParams,
  dynamoDB: {
    readMaxRCU: 500,
    writeMaxRCU: 1000,
    readMinRCU: 1,
    writeMinRCU: 1,
  },
  gateway: {
    throttlingBurstLimit: 500,
    throttlingRateLimit: 1000,
  },
  crossImportFuncArnExportName: `${infraStack.stackName}:CrossImportFuncArn`,
  webAclImport: {
    region: cloudfrontRegion,
    stackName: wafStack.stackName,
    outputKey: 'WebAclArn',
  }
})

serviceStack.addDependency(wafStack, 'WebAcl Arn')
serviceStack.addDependency(infraStack, 'Cross import function')
