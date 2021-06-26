import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as api from '@aws-cdk/aws-apigatewayv2'
import * as log from '@aws-cdk/aws-logs'

import { BaseStack, IBaseStackProps } from '../lib/stack'
import { Lambdas, Cloudfront, Dashbaord, Alarm } from '../constructs'

export interface IDynamoDBProps {
  readMaxRCU: number,
  writeMaxRCU: number,
  readMinRCU: number,
  writeMinRCU: number,
}

export interface IGateway {
  throttlingBurstLimit: number
  throttlingRateLimit: number
}

export interface IServiceStackProps extends IBaseStackProps {
  crossImportFuncArnExportName: string
  dynamoDB: IDynamoDBProps
  gateway: IGateway
}

export class ServiceStack extends BaseStack {
  constructor (scope: cdk.Construct, id: string, props: IServiceStackProps) {
    super(scope, id, props)

    const tableName = `${props.environment}-${props.application}`
    const table = new dynamodb.Table(this, 'DynamoDB', {
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      partitionKey: { name: 'Title', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Year', type: dynamodb.AttributeType.NUMBER },
      pointInTimeRecovery: true,
      tableName,
    })

    const readScaling = table.autoScaleReadCapacity({
      minCapacity: props.dynamoDB.readMinRCU,
      maxCapacity: props.dynamoDB.readMaxRCU,
    })

    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 50,
    })

    const writeCapacity = table.autoScaleWriteCapacity({
      minCapacity: props.dynamoDB.writeMinRCU,
      maxCapacity: props.dynamoDB.writeMaxRCU,
    })

    writeCapacity.scaleOnUtilization({
      targetUtilizationPercent: 50,
    })

    const gateway = new api.HttpApi(this, 'Gateway', {
      disableExecuteApiEndpoint: false,
      createDefaultStage: false,
      corsPreflight: {
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        allowMethods: [
          api.CorsHttpMethod.OPTIONS,
          api.CorsHttpMethod.GET,
          api.CorsHttpMethod.POST,
          api.CorsHttpMethod.PUT,
          api.CorsHttpMethod.PATCH,
          api.CorsHttpMethod.DELETE,
        ],
        allowCredentials: true,
      },
      apiName: `${props.environment}-${props.application}`
    })

    const stageName = props.environment
    const stage = new api.HttpStage(this, 'GatewayStage', {
      httpApi: gateway,
      stageName: stageName,
      autoDeploy: true,
    })

    const cfnStage = stage.node.defaultChild as api.CfnStage
    cfnStage.defaultRouteSettings = {
      throttlingBurstLimit: props.gateway.throttlingBurstLimit,
      throttlingRateLimit: props.gateway.throttlingRateLimit,
    }

    const accessLog = new log.LogGroup(this, 'AccessLogGroup', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: log.RetentionDays.ONE_WEEK,
    })

    cfnStage.accessLogSettings = {
      destinationArn: accessLog.logGroupArn,
      format: JSON.stringify({
        id: '$context.requestId',
        path: '$context.path',
        protocol: '$context.protocol',
        method: '$context.httpMethod',
        time: '$context.requestTime',
        ip: '$context.identity.sourceIp',
        agent: '$context.identity.userAgent',
        latency: '$context.integration.latency'
      })
    }

    new Lambdas(this, 'Lambdas', {
      gateway,
      table,
    })

    const cf = new Cloudfront(this, 'Cloudfront', {
      gateway,
      stage: stageName,
    })

    new Dashbaord(this, 'Dashboard', {
      gateway,
      table,
    })

    new Alarm(this, 'Alarm', {
      gateway,
      table,
    })

    new cdk.CfnOutput(this, 'DistributionID', {
      description: 'DistributionID of Cloudfront',
      value: cf.cloudfront.distributionId,
      exportName: `${this.stackName}:DistributionID`,
    })
  }
}
