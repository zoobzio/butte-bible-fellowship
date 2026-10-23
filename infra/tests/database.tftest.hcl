# The roles: the groups cannot log in, each app's user is a member of its
# group alone, and each app is given its own user's connection string.

mock_provider "neon" {
  mock_resource "neon_project" {
    defaults = {
      id                   = "proj-test"
      database_host        = "ep-test.us-east-1.aws.neon.tech"
      database_host_pooler = "ep-test-pooler.us-east-1.aws.neon.tech"
      database_name        = "bbf"
      database_user        = "bbf_owner"
      database_password    = "owner-secret"
      connection_uri       = "postgres://bbf_owner:owner-secret@ep-test.us-east-1.aws.neon.tech/bbf?sslmode=require"
    }
  }
}
mock_provider "postgresql" {}
mock_provider "vercel" {}

# The web project is imported, which a mock provider cannot do; the override
# stands in for the import.
override_resource {
  target = vercel_project.app["web"]
}

run "roles" {
  command = apply

  assert {
    condition     = alltrue([for role in postgresql_role.group : !role.login])
    error_message = "A group of @bbf/database must not be able to log in."
  }

  assert {
    condition     = toset(keys(postgresql_role.group)) == toset(["web", "admin"])
    error_message = "The groups are exactly the roles of @bbf/database: web and admin."
  }

  assert {
    condition     = alltrue([for key, user in postgresql_role.user : user.login && user.name == "bbf_${key}"])
    error_message = "Each app's user logs in, and is named bbf_<role>."
  }

  assert {
    condition     = alltrue([for key, user in postgresql_role.user : toset(user.roles) == toset([key])])
    error_message = "Each app's user is a member of its own group, and of nothing else."
  }

  assert {
    condition     = alltrue([for user in postgresql_role.user : user.superuser != true && user.create_role != true && user.create_database != true])
    error_message = "An app's user holds no role attribute beyond LOGIN."
  }

  assert {
    condition     = neon_project.bbf.branch[0].role_name == "bbf_owner"
    error_message = "The only role Neon makes is the owner; the apps' roles are made in SQL."
  }
}

run "connection_strings" {
  command = apply

  assert {
    condition = alltrue([
      for key, url in local.database_url :
      startswith(url, "postgres://bbf_${key}:") && endswith(url, "@ep-test-pooler.us-east-1.aws.neon.tech/bbf?sslmode=require")
    ])
    error_message = "Each app connects as its own user, over the pooler, to the project's database, with TLS."
  }

  assert {
    condition     = !strcontains(local.database_url["web"], "bbf_admin") && !strcontains(local.database_url["admin"], "bbf_web")
    error_message = "No app's connection string carries another app's user."
  }

  assert {
    condition     = alltrue([for key, url in local.database_url : !strcontains(url, "owner-secret")])
    error_message = "No app's connection string carries the owner's password."
  }
}
