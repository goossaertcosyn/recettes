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

# Politique de bucket pour autoriser le propriétaire et le public en lecture
resource "scaleway_object_bucket_policy" "bucket_policy" {
  bucket = scaleway_object_bucket.static_website.name
  region = var.region

  policy = jsonencode({
    Version = "2023-04-17"
    Id      = "MyBucketPolicy"
    Statement = [
      {
        Sid       = "Allow owner"
        Effect    = "Allow"
        Principal = {
          SCW = "user_id:85dd5762-078d-4185-bbd2-804e2232c66b"
        }
        Action    = "*"
        Resource = [
          scaleway_object_bucket.static_website.name,
          "${scaleway_object_bucket.static_website.name}/*"
        ]
      },
      {
        Sid       = "Delegate access"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource = "${scaleway_object_bucket.static_website.name}/*"
      }
    ]
  })
}
