resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })


  inline_policy {
    name = "serverless_lambda_dynamodb"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          "Sid"    = "DynamoDBIndexAndStreamAccess",
          "Effect" = "Allow",
          "Action" = [
            "dynamodb:GetShardIterator",
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:DescribeStream",
            "dynamodb:GetRecords",
            "dynamodb:ListStreams"
          ],
          Resource = "*"
        },
        {
          "Sid"    = "DynamoDBTableAccess",
          "Effect" = "Allow",
          "Action" = [
            "dynamodb:BatchGetItem",
            "dynamodb:BatchWriteItem",
            "dynamodb:ConditionCheckItem",
            "dynamodb:PutItem",
            "dynamodb:DescribeTable",
            "dynamodb:DeleteItem",
            "dynamodb:GetItem",
            "dynamodb:Scan",
            "dynamodb:Query",
            "dynamodb:UpdateItem"
          ],
          Resource = "*"
        },
        {
          "Sid"    = "CloudWatchLogs",
          "Effect" = "Allow",
          "Action" = [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents",
          ],
          Resource = "*"
        },
        {
          "Sid"    = "SQS",
          "Effect" = "Allow",
          "Action" = [
            "sqs:SendMessage",
            "sqs:ReceiveMessage",
            "sqs:DeleteMessage",
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl",
          ],
          "Resource" = "*"
        }
      ]
    })
  }
}

resource "aws_lambda_function" "lambda" {
  function_name = each.value.name

  s3_bucket = var.s3_bucket_id
  s3_key    = aws_s3_object.lambda[each.key].key

  runtime = "nodejs18.x"
  handler = "index.handler"

  source_code_hash = filebase64sha512("${path.module}/${var.deploy_folder_path}/${each.value.name}.zip")

  role = aws_iam_role.lambda_exec.arn

  logging_config {
    log_format            = "JSON"
    application_log_level = "DEBUG"
  }

  environment {
    variables = {
      SQS_QUEUES = jsonencode({
        for queue_name, queue in aws_sqs_queue.queues:
        queue_name => {
          url = queue.url
        }
      })
    }
  }


  for_each = { for lambda in setunion(var.gateway_lambdas, var.lambdas, var.queues) : lambda.name => lambda }

  depends_on = [  aws_sqs_queue.queues ]
}
