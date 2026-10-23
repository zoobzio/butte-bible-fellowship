# The roles of `@bbf/database`, as groups that cannot log in. The package
# says what each may do; `roles` of bezoar grants it, as the owner, before
# an app deploys, and skips declaring a group that already exists, so the
# groups may be made here first.
resource "postgresql_role" "group" {
  for_each = toset(["web", "admin"])

  name  = each.key
  login = false
}

# One login user per app, a member of its group alone. Each inherits the
# group's grants and nothing else: it can neither migrate nor grant.
resource "random_password" "user" {
  for_each = postgresql_role.group

  length  = 32
  special = false
}

resource "postgresql_role" "user" {
  for_each = postgresql_role.group

  name     = "bbf_${each.key}"
  login    = true
  password = random_password.user[each.key].result
  roles    = [each.value.name]
}

locals {
  # The connection string each app is given: its own user, over Neon's
  # pooler, which Vercel Functions should connect through.
  database_url = {
    for key, user in postgresql_role.user :
    key => "postgres://${user.name}:${urlencode(random_password.user[key].result)}@${neon_project.bbf.database_host_pooler}/${neon_project.bbf.database_name}?sslmode=require"
  }
}
