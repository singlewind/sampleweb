# Sampleweb

## Table of Content

- [Develope](docs/DEVELOP.md)
- [Deploy](docs/DEPLOY.md)
- [Test](docs/TEST.md)
- [Learn](docs/LEARN.md)

## Architecture
```
                bucket                            dynamodb
                  ▲                                  ▲
                  │                                  │
client ─────► cloudfront ─────► api gateway ─────► lambda
                  │                 │                │
                  ▼                 │                ▼
                 waf                └──────────► cloudwatch
```

## References
- [Project Layout](https://github.com/golang-standards/project-layout)
- [Golang SDK v2](https://pkg.go.dev/github.com/aws/aws-sdk-go-v2)
- [Golang Lambda](https://docs.aws.amazon.com/lambda/latest/dg/lambda-golang.html)
- [CDK lambda-go](https://docs.aws.amazon.com/cdk/api/latest/typescript/api/aws-lambda-go.html)
- [CDK WAF](https://github.com/cdk-patterns/serverless/blob/main/the-waf-apigateway/typescript/lib/api-gateway-stack.ts)
