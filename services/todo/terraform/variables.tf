variable "s3_bucket_id" {
  type     = string
  nullable = false
}

variable "gateway_id" {
  type     = string
  nullable = false
}

variable "gateway_authorizer_jwt_issuer" {
  type     = string
  nullable = false
}

variable "gateway_authorizer_jwt_audience" {
  type     = set(string)
  nullable = false
}

variable "gateway_lambda_execution_arn" {
  type     = string
  nullable = false
}

variable "deploy_folder_path" {
  type    = string
  default = "../deploy"
}

variable "gateway_lambdas" {
  type = set(object({
    name  = string
    route = string
  }))
  default = [
    { name = "add-project", route = "POST /v1/projects" },
    { name = "update-project", route = "PATCH /v1/projects/{projectId}" },
    { name = "add-project-task", route = "POST /v1/projects/{projectId}/tasks" },
    { name = "get-project-tasks", route = "GET /v1/projects/{projectId}/tasks" },
    { name = "get-user-projects", route = "GET /v1/users/{userId}/projects" },
  ]
}

variable "lambdas" {
  type = set(object({
    name = string
  }))
  default = [
    { name = "add-user" },
  ]
}
