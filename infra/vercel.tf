# One Vercel project per app, each rooted at its directory. The build
# command, turbo-ignore, and which branches deploy stay in the app's
# vercel.json, which Vercel reads at build time and which overrides these
# settings; this is the project around it.
locals {
  apps = {
    web = {
      project = "butte-bible-fellowship"
      root    = "apps/web"
    }
    admin = {
      project = "butte-bible-fellowship-admin"
      root    = "apps/admin"
    }
  }
}

resource "vercel_project" "app" {
  for_each = local.apps

  name           = each.value.project
  framework      = "nuxtjs"
  root_directory = each.value.root
  node_version   = "24.x"

  git_repository = {
    type              = "github"
    repo              = var.github_repo
    production_branch = "main"
  }
}

# The database, to each app as its own user. Previews share production's
# database for now; see README.md, "Previews".
resource "vercel_project_environment_variable" "database_url" {
  for_each = vercel_project.app

  project_id = each.value.id
  key        = "NUXT_BEZOAR_URL"
  value      = local.database_url[each.key]
  target     = ["production", "preview"]
  sensitive  = true
  comment    = "Postgres on Neon, as bbf_${each.key}, a member of the ${each.key} role"
}
