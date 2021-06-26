# Deploy

1. Run `npm install`
2. Run `npx cdk bootstrap` (optional, when you run `npm run deploy` it will run bootstrap anyway)
3. Run `npx cdk bootstrap --region us-east-1` (optional, if you would like deploy custom resource in us-east-1 as well)
4. Run `npm run deploy`

## Other Commands
- `npm run cdk:synth` synth cdk template
- `npm run deploy` bootstrap then deploy
