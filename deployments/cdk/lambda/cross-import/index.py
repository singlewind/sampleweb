import logging
import boto3
import cfnresponse
import random
import string
import json

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

def handler(event, context):
  logger.info(json.dumps(event))
  request_type = event.get("RequestType")
  if request_type == "Delete":
    on_delete(event, context)
  else:
    on_update(event, context)

def get_resource_physical_id(event):
  if "PhysicalResourceId" in event:
    return event["PhysicalResourceId"]
  else:
    stack_name = get_stack_name(event["StackId"])
    logical_resource_id = event["LogicalResourceId"]
    random_id = "".join(random.choice(string.ascii_lowercase + string.digits) for _ in range(12))
    return "{0}-{1}-{2}".format(stack_name, logical_resource_id.lower(), random_id)

def get_stack_name(stack_id):
  cfn_client = boto3.client("cloudformation")
  response = cfn_client.describe_stacks(StackName=stack_id)
  return response["Stacks"][0]["StackName"]

def on_update(event, context):
  resource_physical_id = get_resource_physical_id(event)
  try:
    region = event['ResourceProperties']['Region']
    output_key = event['ResourceProperties']['OutputKey']
    stack_name = event['ResourceProperties']['StackName']

    usSession = boto3.Session(region_name=region)
    cfn_client = usSession.client("cloudformation")
    outputs = cfn_client.describe_stacks(
      StackName=stack_name,
    )['Stacks'][0]['Outputs']

    logger.info(json.dumps(outputs))

    output_value = [o for o in outputs if o['OutputKey'] == output_key][0]['OutputValue']

    response_data = {
      "OutputValue": output_value,
      "OutputKey": output_key,
    }

    cfnresponse.send(event, context, cfnresponse.SUCCESS, response_data, resource_physical_id)
  except Exception as e:
    logger.exception(e)
    cfnresponse.send(event, context, cfnresponse.FAILED, {}, resource_physical_id)

def on_delete(event, context):
  resource_physical_id = get_resource_physical_id(event)
  response_data = {}
  cfnresponse.send(event, context, cfnresponse.SUCCESS, response_data, resource_physical_id)