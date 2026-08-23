# Sorties globales pour le déploiement de l'application Recettes PWA

output "bucket_name" {
  description = "Nom du bucket S3 créé"
  value       = module.static_website_bucket.bucket_name
}

output "bucket_region" {
  description = "Région du bucket"
  value       = module.static_website_bucket.bucket_region
}

output "bucket_endpoint" {
  description = "Endpoint public du bucket"
  value       = module.static_website_bucket.bucket_endpoint
}
