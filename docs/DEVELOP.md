# How to Develope

1. clone repo into `git clone git@github.com:singlewind/sampleweb.git $GOPATH/src/github.com/singlewind/sampleweb`
2. Install `make` by run `xcode-select --install` or `brew install make`
3. Run `make build`
4. You can find the binaries in `build/cmd` folder

## Other Commands
- `make build` run security and build binaries 
- `make security` scan go source code for vulnerabilities
- `make clean` delete all builds
- `npm run lint` lint typescript code

## Local DynamoDB

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Run `docker-compose up -d` to start DynamoDB local version
3. Run `aws dynamodb list-tables --endpoint-url http://localhost:8000` to test dynamodb is working
4. Open `http://localhost:8000/shell` and copy the following code into the editor, then run to create the table
```javascript
var params = {
  TableName: 'Movies',
  KeySchema: [ 
    { 
      AttributeName: 'Title',
      KeyType: 'HASH',
    },
    {
      AttributeName: 'Year',
      KeyType: 'RANGE',
    }
  ],
  AttributeDefinitions: [ 
    {
      AttributeName: 'Title',
      AttributeType: 'S', 
    },
    {
      AttributeName: 'Year',
      AttributeType: 'N', 
    }
  ],
  ProvisionedThroughput: { 
    ReadCapacityUnits: 10, 
    WriteCapacityUnits: 10, 
  }
};

dynamodb.createTable(params, function(err, data) {
  if (err) ppJson(err); // an error occurred
  else ppJson(data); // successful response
});
```
5. Repeat step 3 to confirm