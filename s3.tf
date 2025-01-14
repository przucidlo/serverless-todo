resource "aws_s3_bucket" "lambdas" {
  bucket = "przucidlo-dev-lambdas"

  tags = {
    Name        = "lambdas"
    Environment = "dev"
  }
}
