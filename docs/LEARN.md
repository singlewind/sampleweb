# Learn

1. Cloudfront associated WebAcl only can be deployed in us-east-1
2. HTTP API Gateway cannot change to edge as default
3. HTTP API has less feature than REST API
4. Cannot use wafv2 to associate cloudfront acl, need pass webacl arn not id cross region to cloudfront stack. (The documentation is incorrect, it says WebACLId but expect ARN value instead Id)
5. New Bot Control is interesting, but still can be fooled
