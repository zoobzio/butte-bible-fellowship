# Vercel: the two projects, their settings and their environment variables.
# The token is VERCEL_API_TOKEN in the environment.
provider "vercel" {
  team = var.vercel_team
}

# Neon: the Postgres project. The key is NEON_API_KEY in the environment.
provider "neon" {}

# Postgres, inside the Neon project, as its owner: the group roles and the
# login users. Neon grants every role it creates through its own API
# membership in `neon_superuser`, which reads and writes every table, so
# the roles the apps connect as are created here, in SQL, where they get
# nothing but what `@bbf/database` grants them.
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
