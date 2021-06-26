import { Stack, StackProps, Construct, Tags } from '@aws-cdk/core'

export interface IBaseStackProps extends StackProps {
  environment: string;
  application: string;
  version: string;
  createdBy: string;
}

export class BaseStack extends Stack {
  constructor (scope: Construct, id: string, props: IBaseStackProps) {
    super(scope, id, props)

    Tags.of(this).add('Environment', props.environment)
    Tags.of(this).add('Application', props.application)
    Tags.of(this).add('Version', props.version)
    Tags.of(this).add('CreatedBy', props.createdBy)
  }
}
