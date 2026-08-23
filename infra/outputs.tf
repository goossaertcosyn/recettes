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

output "website_endpoint" {
  description = "Endpoint de l'hébergement statique"
  value       = module.static_website_bucket.bucket_website_endpoint
}

output "website_url" {
  description = "URL complète de l'application déployée"
  value       = module.static_website_bucket.bucket_website_url
}

output "deployment_instructions" {
  description = "Instructions pour déployer l'application"
  value = <<-EOT
    
    === Déploiement de l'application Recettes PWA === 
    
    1. Builder l'application :
       cd /path/to/recettes
       npm run build
       
    2. Uploader le contenu du dossier 'dist/' vers le bucket S3 :
       - Utilisez l'outil 's3cmd', 'aws s3 sync' ou le console Scaleway.
       - Commande exemple avec awscli :
         aws s3 sync ./dist/ s3://${module.static_website_bucket.bucket_name}/ --endpoint-url=https://s3.${module.static_website_bucket.bucket_region}.scw.cloud
       
    3. Configurer Cloudflare DNS :
       - Créez un enregistrement CNAME ou A pointant vers : ${module.static_website_bucket.bucket_website_endpoint}
       - Exemple : recettes.votredomaine.com -> ${module.static_website_bucket.bucket_website_endpoint}
       
    4. Activer le CDN Cloudflare (optionnel) :
       - Activez le proxy Cloudflare pour accélérer le chargement.
    
    URL finale : ${module.static_website_bucket.bucket_website_url}
    EOT
}
