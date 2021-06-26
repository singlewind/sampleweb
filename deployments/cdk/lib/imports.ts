import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as cr from '@aws-cdk/custom-resources'

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
  readonly webAclID: string
  constructor (scope: cdk.Construct, id: string, props: IImportsProps) {
    super(scope, id)

    const crossImportFunction = lambda.Function.fromFunctionArn(this, 'CrossImportFunction', cdk.Fn.importValue(props.crossImportFuncArnExportName))
    const wafAclProvider = new cr.Provider(this, 'WafACLProvider', {
      onEventHandler: crossImportFunction,
    })

    const wafInfo = new cdk.CustomResource(this, 'WafAclResource', { serviceToken: wafAclProvider.serviceToken })
    this.webAclID = wafInfo.getAttString('OutputValue')
  }
}
