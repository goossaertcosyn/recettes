# Variables globales pour le déploiement de l'application Recettes PWA

# --- Scaleway Provider ---
variable "scaleway_region" {
  description = "Région Scaleway (ex: fr-par, nl-ams)"
  type        = string
  default     = "fr-par"
}

variable "scaleway_zone" {
  description = "Zone Scaleway (ex: fr-par-1, nl-ams-1)"
  type        = string
  default     = "fr-par-1"
}

variable "scaleway_project_id" {
  description = "ID du projet Scaleway"
  type        = string
}

variable "scaleway_access_key" {
  description = "Clé d'accès Scaleway"
  type        = string
  sensitive   = true
}

variable "scaleway_secret_key" {
  description = "Clé secrète Scaleway"
  type        = string
  sensitive   = true
}

variable "access_key" {
  type      = string
  sensitive = true
}

variable "secret_key" {
  type      = string
  sensitive = true
}

variable "organization_id" {
  type      = string
  sensitive = true
}

variable "project_id" {
  type      = string
  sensitive = true
}

# --- Bucket S3 ---
variable "bucket_name" {
  description = "Nom du bucket S3 (doit être globalement unique)"
  type        = string
  default     = "recettes"
}

variable "bucket_acl" {
  description = "ACL du bucket (public-read, private)"
  type        = string
  default     = "public-read"
}

variable "enable_versioning" {
  description = "Activer la versioning des objets dans le bucket"
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
  default     = "index.html"
}

variable "allowed_origins" {
  description = "Liste des origines autorisées pour CORS (ex: ['https://recettes.tondomaine.com'])"
  type        = list(string)
  default     = ["*"]
}

# --- Environnement ---
variable "environment" {
  description = "Environnement de déploiement (dev, staging, prod)"
  type        = string
  default     = "prod"
}
