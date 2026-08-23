# Module pour créer un bucket S3 Scaleway avec hébergement statique
# Utilisé pour héberger une PWA (Progressive Web App)

terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
}

resource "scaleway_object_bucket" "static_website" {
  name   = var.bucket_name
  region = var.region

  # Activer la versioning (optionnel)
  versioning {
    enabled = var.enable_versioning
  }

  # Configuration CORS pour permettre les requêtes depuis ton domaine
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = var.allowed_origins
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  # Tags pour l'organisation
  tags = var.tags
}

# Politique de bucket pour rendre les objets publics (si ACL = private)
resource "scaleway_object_bucket_policy" "public_read" {
  count = var.acl == "private" ? 1 : 0

  bucket = scaleway_object_bucket.static_website.name
  region = var.region

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = [
          "${scaleway_object_bucket.static_website.name}/*"
        ]
      }
    ]
  })
}
