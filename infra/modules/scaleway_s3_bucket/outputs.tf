# Sorties du module scaleway_s3_bucket

output "bucket_name" {
  description = "Nom du bucket créé"
  value       = scaleway_object_bucket.static_website.name
}

output "bucket_region" {
  description = "Région du bucket"
  value       = scaleway_object_bucket.static_website.region
}

output "bucket_endpoint" {
  description = "Endpoint public du bucket"
  value       = scaleway_object_bucket.static_website.endpoint
}

output "bucket_website_endpoint" {
  description = "Endpoint de l'hébergement statique"
  value       = scaleway_object_bucket.static_website.website_endpoint
}

output "bucket_website_url" {
  description = "URL complète de l'hébergement statique"
  value       = "https://${scaleway_object_bucket.static_website.website_endpoint}"
}
