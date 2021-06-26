#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from '@aws-cdk/core'
import { name, version, author } from '../../package.json'

import { requiredEnv, fromEnv, ifEmtpy } from './lib/utils'
import { WafStack } from './stacks'

const environment = requiredEnv('ENVIRONMENT')

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

new WafStack(app, `${environment}-${configFromEnv.application}-waf`, {
  env: {
    region: 'us-east-1',
  },
  ...commonParams,
  scope: 'CLOUDFRONT',
})
