locals {
  s3_origin_id = "todo_app_origin"
}

resource "aws_s3_bucket" "todo_app" {
  bucket = "przucidlo-dev-todo-app"

  tags = {
    Name = "ToDo App"
  }
}
resource "aws_s3_bucket_public_access_block" "todo_app" {
  bucket = aws_s3_bucket.todo_app.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "todo_app" {
  bucket = aws_s3_bucket.todo_app.bucket

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }

}

resource "aws_s3_bucket_policy" "todo_app" {
  bucket = aws_s3_bucket.todo_app.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Id      = "AllowGetObjects"
    Statement = [
      {
        Sid       = "AllowPublic"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.todo_app.arn}/**"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.todo_app]
}

module "template_files" {
  source = "hashicorp/dir/template"

  base_dir      = "${path.module}/../dist"
  template_vars = {}
}

resource "aws_s3_object" "static_files" {
  for_each = module.template_files.files

  bucket       = aws_s3_bucket.todo_app.id
  key          = each.key
  content_type = each.value.content_type

  source  = each.value.source_path
  content = each.value.content

  etag = each.value.digests.md5
}
resource "aws_cloudfront_origin_access_control" "todo_app" {
  name                              = "todo_app_s3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name              = aws_s3_bucket.todo_app.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.todo_app.id
    origin_id                = local.s3_origin_id
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  # aliases = ["todo.przucidlo.com"]

  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_200"

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  tags = {
    Environment = "production"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
