# Configuration Terraform pour déployer l'application Recettes PWA sur Scaleway S3
# Utilise le module scaleway_s3_bucket pour créer le bucket avec hébergement statique

terraform {
  required_providers {
    scaleway = {
      source  = "scaleway/scaleway"
      version = ">= 2.0.0"
    }
  }
  required_version = ">= 1.0.0"
}

# Configuration du provider Scaleway
provider "scaleway" {
  zone            = var.scaleway_zone
  region          = var.scaleway_region
  access_key      = var.access_key
  secret_key      = var.secret_key
  organization_id = var.organization_id
  project_id      = var.project_id
}

# Module pour créer le bucket S3 avec hébergement statique
module "static_website_bucket" {
  source = "./modules/scaleway_s3_bucket"

  bucket_name       = var.bucket_name
  region            = var.scaleway_region
  acl               = var.bucket_acl
  enable_versioning = var.enable_versioning
  index_document    = var.index_document
  error_document    = var.error_document
  allowed_origins   = var.allowed_origins
}
