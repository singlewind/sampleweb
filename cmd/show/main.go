package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	internal "github.com/singlewind/sampleweb/internal/aws"
	"github.com/singlewind/sampleweb/pkg"
)

func ShowHandler(ctx context.Context, req events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	client, err := internal.NewDynamoDBClient()

	if err != nil {
		response := events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusInternalServerError,
		}
		fmt.Println("Fail to start session")
		fmt.Println(err.Error())
		return response, err
	}

	tableName, _ := os.LookupEnv("TABLE_NAME")
	movieName := "The Big New Movie"
	movieYear := "2015"
	result, err := client.GetItem(context.TODO(), &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"Year": &types.AttributeValueMemberN{
				Value: movieYear,
			},
			"Title": &types.AttributeValueMemberS{
				Value: movieName,
			},
		},
	})

	if err != nil {
		response := events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusInternalServerError,
		}
		fmt.Println(err.Error())
		return response, err
	}

	if result.Item == nil {
		response := events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusNotFound,
		}
		fmt.Printf("Could not find '%v'", movieName)
		return response, nil
	}

	var item pkg.Item
	err = attributevalue.UnmarshalMap(result.Item, &item)
	if err != nil {
		response := events.APIGatewayV2HTTPResponse{
			StatusCode: http.StatusInternalServerError,
		}
		fmt.Printf("Failed to unmarshal Record, '%v'", err)
		return response, err
	}

	var body strings.Builder
	fmt.Fprintln(&body, "Found item:")
	fmt.Fprintln(&body, "Year: ", item.Year)
	fmt.Fprintln(&body, "Title: ", item.Title)
	fmt.Fprintln(&body, "Plot: ", item.Plot)
	fmt.Fprintln(&body, "Rating: ", item.Rating)
	return events.APIGatewayV2HTTPResponse{
		StatusCode: http.StatusOK,
		Body:       body.String(),
	}, nil
}

func main() {
	lambda.Start(ShowHandler)
}
