import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'

export interface IWafImportsProps {
  stackName: string,
  region: string,
  outputKey: string,
}

export interface IImportsProps {
  crossImportFuncArnExportName: string
  waf: IWafImportsProps
}

export class Imports extends cdk.Construct {
  readonly webAclID: cdk.Reference
  constructor (scope: cdk.Construct, id: string, props: IImportsProps) {
    super(scope, id)

    const crossImportFunction = lambda.Function.fromFunctionArn(this, 'CrossImportFunction', cdk.Fn.importValue(props.crossImportFuncArnExportName))

    const wafInfo = new cdk.CustomResource(this, 'WafAclResource', {
      serviceToken: crossImportFunction.functionArn,
      properties: {
        StackName: props.waf.stackName,
        Region: props.waf.region,
        OutputKey: props.waf.outputKey,
      }
    })
    this.webAclID = wafInfo.getAtt('OutputValue')
  }
}
