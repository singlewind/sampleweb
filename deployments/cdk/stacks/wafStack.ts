import * as cdk from '@aws-cdk/core'
import * as wafv2 from '@aws-cdk/aws-wafv2'

import { BaseStack, IBaseStackProps } from '../lib/stack'

export interface WafStackProps extends IBaseStackProps {
  scope: 'CLOUDFRONT' | 'REGIONAL'
}

export class WafStack extends BaseStack {
  constructor (scope: cdk.Construct, id: string, props: WafStackProps) {
    super(scope, id, props)

    const awsCommonRule = <wafv2.CfnWebACL.RuleProperty> {
      priority: 1,
      overrideAction: <wafv2.CfnWebACL.OverrideActionProperty> { none: {} },
      statement: <wafv2.CfnWebACL.StatementProperty> {
        managedRuleGroupStatement: <wafv2.CfnWebACL.ManagedRuleGroupStatementProperty>{
          name: 'AWSManagedRulesCommonRuleSet',
          vendorName: 'AWS',
          excludedRules: [{
            name: 'SizeRestrictions_BODY',
          }]
        }
      },
      visibilityConfig: <wafv2.CfnWebACL.VisibilityConfigProperty> {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsCommonRules',
        sampledRequestsEnabled: true,
      },
      name: 'AWS-AWSManagedRulesCommonRuleSet',
    }

    const awsAnonIPList = <wafv2.CfnWebACL.RuleProperty> {
      priority: 2,
      overrideAction: <wafv2.CfnWebACL.OverrideActionProperty> { none: {} },
      statement: <wafv2.CfnWebACL.StatementProperty> {
        managedRuleGroupStatement: <wafv2.CfnWebACL.ManagedRuleGroupStatementProperty>{
          name: 'AWSManagedRulesAnonymousIpList',
          vendorName: 'AWS',
        }
      },
      visibilityConfig: <wafv2.CfnWebACL.VisibilityConfigProperty> {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsAnonIPList',
        sampledRequestsEnabled: true,
      },
      name: 'AWS-AWSManagedRulesAnonymousIpList',
    }

    const awsIPRepList = <wafv2.CfnWebACL.RuleProperty> {
      priority: 3,
      overrideAction: <wafv2.CfnWebACL.OverrideActionProperty> { none: {} },
      statement: <wafv2.CfnWebACL.StatementProperty> {
        managedRuleGroupStatement: <wafv2.CfnWebACL.ManagedRuleGroupStatementProperty>{
          name: 'AWSManagedRulesAmazonIpReputationList',
          vendorName: 'AWS',
        }
      },
      visibilityConfig: <wafv2.CfnWebACL.VisibilityConfigProperty> {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsReputation',
        sampledRequestsEnabled: true,
      },
      name: 'AWS-AWSManagedRulesAmazonIpReputationList',
    }

    const awsBotControl = <wafv2.CfnWebACL.RuleProperty> {
      priority: 4,
      overrideAction: <wafv2.CfnWebACL.OverrideActionProperty> { none: {} },
      statement: <wafv2.CfnWebACL.StatementProperty> {
        managedRuleGroupStatement: <wafv2.CfnWebACL.ManagedRuleGroupStatementProperty>{
          name: 'AWSManagedRulesBotControlRuleSet',
          vendorName: 'AWS',
        }
      },
      visibilityConfig: <wafv2.CfnWebACL.VisibilityConfigProperty> {
        cloudWatchMetricsEnabled: true,
        metricName: 'awsBotControl',
        sampledRequestsEnabled: true,
      },
      name: 'AWS-AWSManagedRulesBotControlRuleSet',
    }

    const webAclName = `${props.environment}-${props.application}`
    const webAclMetricName = `${props.environment}-${props.application}-webacl`

    const webacl = new wafv2.CfnWebACL(this, 'WebAcl', {
      defaultAction: <wafv2.CfnWebACL.DefaultActionProperty> {
        allow: {},
      },
      scope: props.scope,
      visibilityConfig: <wafv2.CfnWebACL.VisibilityConfigProperty> {
        cloudWatchMetricsEnabled: true,
        sampledRequestsEnabled: true,
        metricName: webAclMetricName,
      },
      rules: [
        awsCommonRule,
        awsAnonIPList,
        awsIPRepList,
        awsBotControl,
      ],
      name: webAclName,
    })

    new cdk.CfnOutput(this, 'WebAclID', {
      description: `WebAclID of ${webAclName}`,
      value: webacl.attrId,
      exportName: `${this.stackName}:WebACLID`,
    })

    new cdk.CfnOutput(this, 'WebAclArn', {
      description: `WebAclArn of ${webAclName}`,
      value: webacl.attrArn,
      exportName: `${this.stackName}:WebAclArn`,
    })

    new cdk.CfnOutput(this, 'WebAclMetricName', {
      description: `Metric name of ${webAclName}`,
      value: webAclMetricName,
      exportName: `${this.stackName}:WebAclMetricName`,
    })
  }
}
