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
