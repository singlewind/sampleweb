# Test

1. Run [deploy](DEPLOY.md)
2. Copy the cloudfront url in the console
2. Open browser
  a. https://[cloudfront]/
  b. https://[cloudfront]/error (should throw 500 error)
  c. https://[cloudfront]/upsert (shold throw 404 error, GET method is not supported)
  d. https://[cloudfront]/show (should show 404 error for now)
  e. Run `curl -X POST https://[cloudfront]/upsert` (should show 403 error, curl was blocked by waf)
  f. Run `curl -X POST -A "Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/81.0" https://[cloudfront]/upsert` (should show Added!)
  g. https://[cloudfront]/show (should show 200 now with movie information)