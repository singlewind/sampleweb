import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as cloudwatch from '@aws-cdk/aws-cloudwatch'
import * as sns from '@aws-cdk/aws-sns'
import * as actions from '@aws-cdk/aws-cloudwatch-actions'
import * as api from '@aws-cdk/aws-apigatewayv2'
import { metricForApiGw } from '../lib/utils'

export interface AlarmProps {
  table?: dynamodb.ITable
  gateway?: api.IApi
}

export class Alarm extends cdk.Construct {
  constructor (scope: cdk.Construct, id: string, props: AlarmProps = {}) {
    super(scope, id)

    const errorTopic = new sns.Topic(this, 'errorTopic')

    if (props.table) {
      const dynamoDBTotalErrors = new cloudwatch.MathExpression({
        expression: 'm1 + m2',
        label: 'DynamoDB Errors',
        usingMetrics: {
          m1: props.table.metricUserErrors(),
          m2: props.table.metricSystemErrorsForOperations(),
        },
        period: cdk.Duration.minutes(5),
      })

      new cloudwatch.Alarm(this, 'DynamoDB Errors > 0', {
        metric: dynamoDBTotalErrors,
        threshold: 0,
        evaluationPeriods: 6,
        datapointsToAlarm: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new actions.SnsAction(errorTopic))

      const dynamoDBThrottles = new cloudwatch.MathExpression({
        expression: 'm1 + m2',
        label: 'DynamoDB Throttles',
        usingMetrics: {
          m1: props.table.metric('ReadThrottleEvents', { statistic: 'sum' }),
          m2: props.table.metric('WriteThrottleEvents', { statistic: 'sum' }),
        },
        period: cdk.Duration.minutes(5),
      })

      new cloudwatch.Alarm(this, 'DynamoDB Table Reads/Writes Throttled', {
        metric: dynamoDBThrottles,
        threshold: 1,
        evaluationPeriods: 6,
        datapointsToAlarm: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new actions.SnsAction(errorTopic))
    }

    if (props.gateway) {
      const apiGateway4xxErrorPercentage = new cloudwatch.MathExpression({
        expression: 'm1/m2*100',
        label: '% API Gateway 4xx Errors',
        usingMetrics: {
          m1: metricForApiGw(props.gateway.apiId, '4XXError', '4XX Errors', 'sum'),
          m2: metricForApiGw(props.gateway.apiId, 'Count', '# Requests', 'sum'),
        },
        period: cdk.Duration.minutes(5),
      })

      new cloudwatch.Alarm(this, 'API Gateway 4XX Errors > 5%', {
        metric: apiGateway4xxErrorPercentage,
        threshold: 5,
        evaluationPeriods: 6,
        datapointsToAlarm: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new actions.SnsAction(errorTopic))

      const apiGateway5xxErrorPercentage = new cloudwatch.MathExpression({
        expression: 'm1/m2*100',
        label: '% API Gateway 4xx Errors',
        usingMetrics: {
          m1: metricForApiGw(props.gateway.apiId, '5XXError', '5XX Errors', 'sum'),
          m2: metricForApiGw(props.gateway.apiId, 'Count', '# Requests', 'sum'),
        },
        period: cdk.Duration.minutes(5),
      })

      new cloudwatch.Alarm(this, 'API Gateway 5XX Errors > 1%', {
        metric: apiGateway5xxErrorPercentage,
        threshold: 1,
        evaluationPeriods: 6,
        datapointsToAlarm: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new actions.SnsAction(errorTopic))

      new cloudwatch.Alarm(this, 'API p99 latency alarm >= 5s', {
        metric: metricForApiGw(props.gateway.apiId, 'Latency', 'API GW Latency', 'p99'),
        threshold: 5000,
        evaluationPeriods: 6,
        datapointsToAlarm: 1,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }).addAlarmAction(new actions.SnsAction(errorTopic))
    }
  }
}
