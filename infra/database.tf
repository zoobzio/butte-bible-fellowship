resource "postgresql_role" "group" {
  for_each = toset(["web", "admin"])

  name  = each.key
  login = false
}

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
  database_url = {
    for key, user in postgresql_role.user :
    key => "postgres://${user.name}:${urlencode(random_password.user[key].result)}@${neon_project.bbf.database_host_pooler}/${neon_project.bbf.database_name}?sslmode=require"
  }
}
