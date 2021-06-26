# Deploy

1. Run `npm install`
2. Run `cp .sample.envrc .envrc` and change the value based on needs. Default value should working straight away
3. If you have `direnv`, run `direnv allow`, other wise `source .envrc` 
4. Run `npx cdk bootstrap` (optional, when you run `npm run deploy` it will run bootstrap anyway)
5. Run `npx cdk bootstrap --region us-east-1` (optional, if you would like deploy custom resource in us-east-1 as well)
6. Run `npm run deploy`

## Other Commands
- `npm run cdk:synth` synth cdk template
- `npm run deploy` bootstrap then deploy
