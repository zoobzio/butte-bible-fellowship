variable "vercel_team" {
  description = "The Vercel team that owns the projects: its slug or id."
  type        = string
  default     = "team_IGESQAufr4GQERuqVBoSAc0o"
}

variable "github_repo" {
  description = "The GitHub repository Vercel deploys from, as owner/name."
  type        = string
  default     = "zoobzio/butte-bible-fellowship"
}

variable "neon_region" {
  description = "The Neon region. Vercel Functions default to iad1 (us-east-1), so the database sits beside them."
  type        = string
  default     = "aws-us-east-1"
}

variable "neon_org_id" {
  description = "The Neon organization that owns the project. Null for a personal account."
  type        = string
  default     = null
}
