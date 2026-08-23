# Variables pour le module scaleway_s3_bucket

variable "bucket_name" {
  description = "Nom du bucket S3 (doit être unique globalement)"
  type        = string
}

variable "region" {
  description = "Région Scaleway où créer le bucket (ex: fr-par, nl-ams)"
  type        = string
  default     = "fr-par"
}

variable "acl" {
  description = "ACL du bucket (public-read, private, etc.)"
  type        = string
  default     = "public-read"
}

variable "enable_versioning" {
  description = "Activer la versioning des objets"
  type        = bool
  default     = false
}

variable "index_document" {
  description = "Document par défaut pour l'hébergement statique"
  type        = string
  default     = "index.html"
}

variable "error_document" {
  description = "Document d'erreur pour l'hébergement statique"
  type        = string
  default     = "index.html"  # Redirige vers index.html pour les routes SPA
}

variable "allowed_origins" {
  description = "Liste des origines autorisées pour CORS"
  type        = list(string)
  default     = ["*"]
}

variable "tags" {
  description = "Tags à appliquer au bucket"
  type        = map(string)
  default     = {}
}
