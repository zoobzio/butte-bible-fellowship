output "vercel_projects" {
  description = "The Vercel project ids, by app."
  value       = { for key, project in vercel_project.app : key => project.id }
}

output "neon_project_id" {
  description = "The Neon project id."
  value       = neon_project.bbf.id
}

output "database_host" {
  description = "The direct (non-pooled) host of the production database."
  value       = neon_project.bbf.database_host
}

output "owner_database_url" {
  description = "The owner's connection string: what applies the roles, the migrations and the seeds before an app deploys. Never an app's."
  value       = neon_project.bbf.connection_uri
  sensitive   = true
}
