import * as cdk from '@aws-cdk/core'
import * as api from '@aws-cdk/aws-apigatewayv2'
import * as log from '@aws-cdk/aws-logs'

export interface IGatewayThrottling {
  throttlingBurstLimit: number
  throttlingRateLimit: number
}

export interface IGatewayProps extends IGatewayThrottling {
  stageName: string
  apiName: string
}

export class Gateway extends cdk.Construct {
  readonly gateway: api.HttpApi
  constructor (scope: cdk.Construct, id: string, props: IGatewayProps) {
    super(scope, id)

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
      apiName: props.apiName
    })

    const stage = new api.HttpStage(this, 'GatewayStage', {
      httpApi: gateway,
      stageName: props.stageName,
      autoDeploy: true,
    })

    const cfnStage = stage.node.defaultChild as api.CfnStage
    cfnStage.defaultRouteSettings = {
      throttlingBurstLimit: props.throttlingBurstLimit,
      throttlingRateLimit: props.throttlingRateLimit,
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

    this.gateway = gateway
  }
}
