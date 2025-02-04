resource "aws_sqs_queue" "queues" {
  for_each = { for queue in var.queues : queue.name => queue }

  name = each.value.name

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount = 3
  })
}

resource "aws_sqs_queue" "dlq" {
  name = "dlq"
}

resource "aws_lambda_event_source_mapping" "lambda_sqs" {
  event_source_arn = each.value.arn
  function_name    = aws_lambda_function.lambda[each.key].function_name

  for_each = aws_sqs_queue.queues

  depends_on = [ aws_lambda_function.lambda ]
}

output "sqs_queues" {
  value = {
    for queue_name, queue in aws_sqs_queue.queues:
    queue_name => {
      url = queue.url
    }
  }
}
