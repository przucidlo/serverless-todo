
resource "aws_s3_object" "lambda" {
  bucket = var.s3_bucket_id

  key    = "${each.value.name}.zip"
  source = "${path.module}/${var.deploy_folder_path}/${each.value.name}.zip"

  etag = filemd5("${path.module}/${var.deploy_folder_path}/${each.value.name}.zip")
  
  for_each = { for lambda in setunion(
    toset([for lambda in var.gateway_lambdas : { name = lambda.name }]),
    var.lambdas,
    var.queues
  ) : lambda.name => lambda }
}
