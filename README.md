# Sampleweb

## Table of Content
- [Develope](docs/DEVELOP.md)
- [Deploy](docs/DEPLOY.md)

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
