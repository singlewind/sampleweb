import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as cloudwatch from '@aws-cdk/aws-cloudwatch'
import * as api from '@aws-cdk/aws-apigatewayv2'
import * as utils from '../lib/utils'

export interface DashbaordProps {
  table?: dynamodb.ITable
  gateway?: api.IApi
}

export class Dashbaord extends cdk.Construct {
  constructor (scope: cdk.Construct, id: string, props: DashbaordProps = {}) {
    super(scope, id)

    const stack = cdk.Stack.of(this)

    const dashboard = new cloudwatch.Dashboard(this, 'CloudWatchDashBoard', {
      dashboardName: `${stack.stackName}-dashboard`
    })

    if (props.table) {
      dashboard.addWidgets(
        utils.buildGraphWidget('DynamoDB Latency', [
          props.table.metricSuccessfulRequestLatency({ dimensions: { TableName: props.table.tableName, Operation: 'GetItem' } }),
          props.table.metricSuccessfulRequestLatency({ dimensions: { TableName: props.table.tableName, Operation: 'PutItem' } }),
        ], true),
        utils.buildGraphWidget('DynamoDB Consumed Read/Write Units', [
          props.table.metric('ConsumedReadCapacityUnits'),
          props.table.metric('ConsumedWriteCapacityUnits')
        ], false),
        utils.buildGraphWidget('DynamoDB Throttles', [
          props.table.metric('ReadThrottleEvents', { statistic: 'sum' }),
          props.table.metric('WriteThrottleEvents', { statistic: 'sum' }),
        ], true)
      )
    }

    if (props.gateway) {
      dashboard.addWidgets(
        utils.buildGraphWidget('Requests', [
          utils.metricForApiGw(props.gateway.apiId, 'Count', '# Requests', 'sum')
        ]),
        utils.buildGraphWidget('API GW Latency', [
          utils.metricForApiGw(props.gateway.apiId, 'Latency', 'API Latency p50', 'p50'),
          utils.metricForApiGw(props.gateway.apiId, 'Latency', 'API Latency p90', 'p90'),
          utils.metricForApiGw(props.gateway.apiId, 'Latency', 'API Latency p99', 'p99')
        ], true),
        utils.buildGraphWidget('API GW Errors', [
          utils.metricForApiGw(props.gateway.apiId, '4XXError', '4XX Errors', 'sum'),
          utils.metricForApiGw(props.gateway.apiId, '5XXError', '5XX Errors', 'sum')
        ], true),
      )
    }
  }
}
