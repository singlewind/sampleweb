package main

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	internal "github.com/singlewind/sampleweb/internal/aws"
	"github.com/singlewind/sampleweb/pkg"
)

func UpsertHandler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	client, err := internal.NewDynamoDBClient()

	if err != nil {
		response := events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusInternalServerError,
		}
		fmt.Println("Fail to start session")
		fmt.Println(err.Error())
		return response, err
	}

	item := pkg.Item{
		Year:   2015,
		Title:  "The Big New Movie",
		Plot:   "Nothing happens at all.",
		Rating: 0.0,
	}

	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		response := events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusInternalServerError,
		}
		fmt.Println("Got error marshalling new movie item:")
		fmt.Println(err.Error())
		return response, err
	}

	tableName, _ := os.LookupEnv("TABLE_NAME")

	input := &dynamodb.PutItemInput{
		Item:      av,
		TableName: aws.String(tableName),
	}

	_, err = client.PutItem(context.TODO(), input)
	if err != nil {
		response := events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusInternalServerError,
		}
		fmt.Println("Got error calling PutItem:")
		fmt.Println(err.Error())
		return response, err
	}

	return events.APIGatewayV2HTTPResponse{
		StatusCode: http.StatusOK,
		Body:       "Added!",
	}, nil

}

func main() {
	lambda.Start(UpsertHandler)
}
