provider "vercel" {
  team = var.vercel_team
}

provider "neon" {}

# Roles that the Neon API creates join neon_superuser. Create the app roles in SQL.
provider "postgresql" {
  host            = neon_project.bbf.database_host
  port            = 5432
  database        = neon_project.bbf.database_name
  username        = neon_project.bbf.database_user
  password        = neon_project.bbf.database_password
  sslmode         = "require"
  superuser       = false
  connect_timeout = 15
}
