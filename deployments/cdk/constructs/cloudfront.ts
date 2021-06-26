import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as iam from '@aws-cdk/aws-iam'
import * as api from '@aws-cdk/aws-apigatewayv2'
import * as cloudfront from '@aws-cdk/aws-cloudfront'
import * as origins from '@aws-cdk/aws-cloudfront-origins'

export interface ICloudfrontProps {
  gateway: api.HttpApi
  stage: string
  webAclArn: string
}

export class Cloudfront extends cdk.Construct {
  readonly cloudfront: cloudfront.Distribution
  constructor (scope: cdk.Construct, id: string, props: ICloudfrontProps) {
    super(scope, id)

    const stack = cdk.Stack.of(this)

    const loggingBucket = new s3.Bucket(this, 'Bucket', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      accessControl: s3.BucketAccessControl.LOG_DELIVERY_WRITE,
      bucketName: `${stack.stackName}-cloudfront-logging`
    })

    const bucketPolicy = new s3.BucketPolicy(this, 'BucketPolicy', {
      bucket: loggingBucket,
    })

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        sid: 'HttpsOnly',
        actions: ['*'],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false'
          },
        },
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        resources: [`${loggingBucket.bucketArn}/*`]
      })
    )

    const apiEndPointUrlWithoutProtocol = cdk.Fn.select(1, cdk.Fn.split('://', props.gateway.apiEndpoint))
    const apiEndPointDomainName = cdk.Fn.select(0, cdk.Fn.split('/', apiEndPointUrlWithoutProtocol))

    this.cloudfront = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.HttpOrigin(apiEndPointDomainName, {
          originPath: `/${props.stage}`,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      },
      enableLogging: true,
      logBucket: loggingBucket,
      webAclId: props.webAclArn,
    })
  }
}
