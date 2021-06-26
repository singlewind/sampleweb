import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

import { BaseStack, IBaseStackProps } from '../lib/stack'
import { Imports, IWafImportsProps, IImportsProps } from '../lib/imports'

export interface IDynamoDBProps {
  readMaxRCU: number,
  writeMaxRCU: number,
  readMinRCU: number,
  writeMinRCU: number,
}

export interface IServiceStackProps extends IImportsProps, IBaseStackProps {
  crossImportFuncArnExportName: string
  waf: IWafImportsProps
  dynamoDB: IDynamoDBProps
}

export class ServiceStack extends BaseStack {
  constructor (scope: cdk.Construct, id: string, props: IServiceStackProps) {
    super(scope, id, props)

    /* eslint-disable */
    const imports = new Imports(this, 'Imports', props)

    const tableName = `${props.environment}-${props.application}`
    const table = new dynamodb.Table(this, "DynamoDB", {
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      partitionKey: { name: 'Title', type: dynamodb.AttributeType.STRING },
      sortKey: {name: 'Year', type: dynamodb.AttributeType.NUMBER },
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
  }
}
