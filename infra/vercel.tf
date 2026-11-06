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

# The app's vercel.json overrides these settings at build time.
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

resource "vercel_project_environment_variable" "database_url" {
  for_each = vercel_project.app

  project_id = each.value.id
  key        = "NUXT_BEZOAR_URL"
  value      = local.database_url[each.key]
  target     = ["production", "preview"]
  sensitive  = true
  comment    = "Postgres on Neon, as bbf_${each.key}, a member of the ${each.key} role"
}

# Where the admin keeps the staff's photos: a public Blob store, connected
# to the admin project alone, which gives it BLOB_READ_WRITE_TOKEN. The site
# reads a photo by the URL the database holds, and needs no token.
resource "vercel_blob_store" "avatars" {
  name   = "butte-bible-fellowship-avatars"
  access = "public"
}

resource "vercel_blob_project_connection" "avatars" {
  blob_store_id = vercel_blob_store.avatars.id
  project_id    = vercel_project.app["admin"].id
}
