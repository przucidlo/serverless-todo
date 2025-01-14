module "todo" {
  source                          = "./services/todo/terraform"
  gateway_id                      = aws_apigatewayv2_api.public.id
  s3_bucket_id                    = aws_s3_bucket.lambdas.id
  gateway_lambda_execution_arn    = aws_apigatewayv2_api.public.execution_arn
  gateway_authorizer_jwt_audience = ["1399h9j4sa1h4k3psmh8ud7b3a"]
  gateway_authorizer_jwt_issuer   = "https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_OM1hxkZx1"
}

module "todo_app" {
  source = "./apps/todo/terraform"
}
