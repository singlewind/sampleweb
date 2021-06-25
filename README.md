# Sampleweb

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