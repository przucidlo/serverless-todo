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
    name   = string
    routes = list(string)
  }))
  default = [
    {
      name = "router",
      routes = [
        "POST /v1/projects",
        "PATCH /v1/projects/{projectId}",
        "DELETE /v1/projects/{projectId}",
        "POST /v1/projects/{projectId}/tasks",
        "GET /v1/projects/{projectId}/tasks",
        "PATCH /v1/projects/{projectId}/tasks/{taskId}",
        "GET /v1/users/{userId}/projects"
      ]
    }
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

variable "queues" {
  type = set(object({
    name = string
  }))
  default = [
    { name = "update-project-members" },
  ]
}
