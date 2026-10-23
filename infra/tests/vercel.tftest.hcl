# The Vercel projects: one per app at its directory, and the environment
# each is given.

mock_provider "neon" {
  mock_resource "neon_project" {
    defaults = {
      database_host        = "ep-test.us-east-1.aws.neon.tech"
      database_host_pooler = "ep-test-pooler.us-east-1.aws.neon.tech"
      database_name        = "bbf"
      database_user        = "bbf_owner"
      database_password    = "owner-secret"
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

run "projects" {
  command = apply

  assert {
    condition     = length(vercel_project.app) == 2 && vercel_project.app["web"].root_directory == "apps/web" && vercel_project.app["admin"].root_directory == "apps/admin"
    error_message = "One project per app, rooted at the app's directory."
  }

  assert {
    condition     = alltrue([for project in vercel_project.app : project.framework == "nuxtjs"])
    error_message = "Every app is a Nuxt app."
  }

  assert {
    condition     = alltrue([for project in vercel_project.app : project.git_repository.repo == var.github_repo && project.git_repository.production_branch == "main"])
    error_message = "Every project deploys this repository, with main as production."
  }

  assert {
    condition     = alltrue([for project in vercel_project.app : project.build_command == null && project.ignore_command == null])
    error_message = "The build command and turbo-ignore belong to the app's vercel.json, not the project."
  }
}

run "environment" {
  command = apply

  assert {
    condition     = toset(keys(vercel_project_environment_variable.database_url)) == toset(keys(vercel_project.app))
    error_message = "Every project is given a database."
  }

  assert {
    condition = alltrue([
      for key, env in vercel_project_environment_variable.database_url :
      env.key == "NUXT_BEZOAR_URL" && env.sensitive && env.value == local.database_url[key]
    ])
    error_message = "Each project's NUXT_BEZOAR_URL is its own app's connection string, held as a secret."
  }
}
