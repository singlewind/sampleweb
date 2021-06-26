import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import { PythonFunction } from '@aws-cdk/aws-lambda-python'

import { BaseStack, IBaseStackProps } from '../lib/stack'

export class InfraStack extends BaseStack {
  constructor (scope: cdk.Construct, id: string, props: IBaseStackProps) {
    super(scope, id, props)

    const crossImportFunctionName = `${this.stackName}-cross-import`
    const crossImportFunction = new PythonFunction(this, 'CrossImportCustomResourceFunction', {
      entry: 'deployments/cdk/lambda/cross-import',
      runtime: lambda.Runtime.PYTHON_3_8,
    })

    cdk.Tags.of(crossImportFunction).add('Name', crossImportFunctionName)

    crossImportFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cloudformation:*'],
      resources: ['*'],
      effect: iam.Effect.ALLOW,
    }))

    new cdk.CfnOutput(this, 'CrossImportFuncArn', {
      description: `Arn of ${crossImportFunctionName}`,
      value: crossImportFunction.functionArn,
      exportName: `${this.stackName}:CrossImportFuncArn`,
    })
  }
}
