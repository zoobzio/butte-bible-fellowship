# The Postgres project. One branch, `main`, is production; its default
# role is the database's owner, and the only role Neon itself creates.
resource "neon_project" "bbf" {
  name       = "butte-bible-fellowship"
  region_id  = var.neon_region
  org_id     = var.neon_org_id
  pg_version = 17

  branch {
    name          = "main"
    database_name = "bbf"
    role_name     = "bbf_owner"
  }
}
