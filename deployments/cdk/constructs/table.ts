import * as cdk from '@aws-cdk/core'
import * as dynamodb from '@aws-cdk/aws-dynamodb'

export interface IDynamoDBThrotllingProps {
  readMaxRCU: number,
  writeMaxRCU: number,
  readMinRCU: number,
  writeMinRCU: number,
}

export interface IDynamoDBProps extends IDynamoDBThrotllingProps {
  tableName: string
}

export class Table extends cdk.Construct {
  readonly table: dynamodb.Table
  constructor (scope: cdk.Construct, id: string, props: IDynamoDBProps) {
    super(scope, id)

    const table = new dynamodb.Table(this, 'DynamoDB', {
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      partitionKey: { name: 'Title', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Year', type: dynamodb.AttributeType.NUMBER },
      pointInTimeRecovery: true,
      tableName: props.tableName,
    })

    const readScaling = table.autoScaleReadCapacity({
      minCapacity: props.readMinRCU,
      maxCapacity: props.readMaxRCU,
    })

    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 50,
    })

    const writeCapacity = table.autoScaleWriteCapacity({
      minCapacity: props.writeMinRCU,
      maxCapacity: props.writeMaxRCU,
    })

    writeCapacity.scaleOnUtilization({
      targetUtilizationPercent: 50,
    })

    this.table = table
  }
}
