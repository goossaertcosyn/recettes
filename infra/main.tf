# Configuration Terraform pour déployer l'application Recettes PWA sur Scaleway S3
# Utilise le module scaleway_s3_bucket pour créer le bucket avec hébergement statique

terraform {
  required_version = ">= 1.0.0"
  
  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = ">= 2.0.0"
    }
  }
}

# Configuration du provider Scaleway
provider "scaleway" {
  zone            = var.scaleway_zone  # Zone par défaut (ex: fr-par-1)
  region          = var.scaleway_region
  project_id      = var.scaleway_project_id
  access_key      = var.scaleway_access_key
  secret_key      = var.scaleway_secret_key
}

# Module pour créer le bucket S3 avec hébergement statique
module "static_website_bucket" {
  source = "./modules/scaleway_s3_bucket"
  
  bucket_name      = var.bucket_name
  region           = var.scaleway_region
  acl              = var.bucket_acl
  enable_versioning = var.enable_versioning
  index_document   = var.index_document
  error_document   = var.error_document
  allowed_origins  = var.allowed_origins
  tags = {
    Project     = "recettes-pwa"
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
