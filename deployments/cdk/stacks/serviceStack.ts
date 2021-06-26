import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'

import { BaseStack, IBaseStackProps } from '../lib/stack'
import {
  Lambdas,
  Cloudfront,
  Dashbaord,
  Alarm,
  Table,
  Gateway,
  IDynamoDBThrotllingProps,
  IGatewayThrottling,
} from '../constructs'

export interface IServiceStackProps extends IBaseStackProps {
  dynamoDB: IDynamoDBThrotllingProps
  gateway: IGatewayThrottling
  crossImportFuncArnExportName: string
  webAclImport: {
    stackName: string,
    region: string,
    outputKey: string,
  }
}

export class ServiceStack extends BaseStack {
  constructor (scope: cdk.Construct, id: string, props: IServiceStackProps) {
    super(scope, id, props)

    const crossImportFunction = lambda.Function.fromFunctionArn(this, 'CrossImportFunction', cdk.Fn.importValue(props.crossImportFuncArnExportName))

    const webAcl = new cdk.CustomResource(this, 'CloudfrontResource', {
      serviceToken: crossImportFunction.functionArn,
      properties: {
        StackName: props.webAclImport.stackName,
        Region: props.webAclImport.region,
        OutputKey: props.webAclImport.outputKey,
      }
    })

    const tableName = `${props.environment}-${props.application}`
    const dynamodb = new Table(this, 'DynamoDB', {
      ...props.dynamoDB,
      tableName,
    })
    const table = dynamodb.table

    const apiName = `${props.environment}-${props.application}`
    const stageName = props.environment
    const api = new Gateway(this, 'Gateway', {
      apiName,
      stageName,
      ...props.gateway,
    })
    const gateway = api.gateway

    new Lambdas(this, 'Lambdas', {
      gateway,
      table,
    })

    const cf = new Cloudfront(this, 'Cloudfront', {
      gateway,
      stage: stageName,
      webAclArn: webAcl.getAtt('OutputValue').toString()
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

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      description: 'DistributionDomainName of Cloudfront',
      value: cf.cloudfront.distributionDomainName,
      exportName: `${this.stackName}:DistributionDomainName`,
    })
  }
}
