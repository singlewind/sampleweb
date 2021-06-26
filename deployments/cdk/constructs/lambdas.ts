import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as api from '@aws-cdk/aws-apigatewayv2'
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations'
import { GoFunction } from '@aws-cdk/aws-lambda-go'

export interface ILambdasProps {
  gateway: api.HttpApi,
  table: dynamodb.Table,
}

export class Lambdas extends cdk.Construct {
  readonly webAclID: string
  constructor (scope: cdk.Construct, id: string, props: ILambdasProps) {
    super(scope, id)

    const stack = cdk.Stack.of(this)

    const errorFunction = new GoFunction(this, 'ErrorFunction', {
      entry: 'cmd/error',
    })

    cdk.Tags.of(errorFunction).add('Name', `${stack.stackName}-error`)

    props.gateway.addRoutes({
      path: '/error',
      methods: [api.HttpMethod.GET, api.HttpMethod.HEAD, api.HttpMethod.OPTIONS],
      integration: new integrations.LambdaProxyIntegration({
        handler: errorFunction,
      })
    })

    const homeFunction = new GoFunction(this, 'HomeFunction', {
      entry: 'cmd/home',
    })

    cdk.Tags.of(homeFunction).add('Name', `${stack.stackName}-home`)

    props.gateway.addRoutes({
      path: '/',
      methods: [api.HttpMethod.GET, api.HttpMethod.HEAD, api.HttpMethod.OPTIONS],
      integration: new integrations.LambdaProxyIntegration({
        handler: homeFunction,
      })
    })

    const showFunction = new GoFunction(this, 'ShowFunction', {
      entry: 'cmd/show',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    })

    cdk.Tags.of(showFunction).add('Name', `${stack.stackName}-show`)

    props.table.grant(showFunction, 'dynamodb:GetItem')

    props.gateway.addRoutes({
      path: '/show',
      methods: [api.HttpMethod.GET, api.HttpMethod.HEAD, api.HttpMethod.OPTIONS],
      integration: new integrations.LambdaProxyIntegration({
        handler: showFunction,
      })
    })

    const upsertFunction = new GoFunction(this, 'UpsertFunction', {
      entry: 'cmd/upsert',
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    })

    cdk.Tags.of(upsertFunction).add('Name', `${stack.stackName}-upsert`)

    props.table.grant(upsertFunction, 'dynamodb:GetItem', 'dynamodb:PutItem')

    props.gateway.addRoutes({
      path: '/upsert',
      methods: [api.HttpMethod.POST, api.HttpMethod.PUT, api.HttpMethod.PATCH, api.HttpMethod.HEAD, api.HttpMethod.OPTIONS],
      integration: new integrations.LambdaProxyIntegration({
        handler: upsertFunction,
      })
    })
  }
}
