resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id = var.gateway_id

  integration_uri    = aws_lambda_function.lambda[each.key].invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"

  for_each = { for lambda in var.gateway_lambdas : lambda.name => lambda if lambda.route != "" }
}

resource "aws_apigatewayv2_route" "route" {
  api_id = var.gateway_id

  route_key = each.value.route
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration[each.key].id}"

  authorizer_id      = aws_apigatewayv2_authorizer.authorizer.id
  authorization_type = "JWT"

  for_each = { for lambda in var.gateway_lambdas : lambda.name => lambda if lambda.route != "" }
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda[each.key].function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${var.gateway_lambda_execution_arn}/*/*"

  for_each = { for lambda in var.gateway_lambdas : lambda.name => lambda if lambda.route != "" }
}

resource "aws_apigatewayv2_authorizer" "authorizer" {
  api_id           = var.gateway_id
  authorizer_type  = "JWT"
  name             = "jwt-authorizer"
  identity_sources = ["$request.header.Authorization"]
  jwt_configuration {
    audience = var.gateway_authorizer_jwt_audience
    issuer   = var.gateway_authorizer_jwt_issuer
  }
}
