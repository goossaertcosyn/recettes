# Infrastructure as Code - Recettes PWA

Ce dossier contient la configuration Terraform pour déployer l'application **Recettes PWA** sur **Scaleway S3** avec hébergement statique.

---

## 🗂️ Structure

```
infra/
├── main.tf               # Configuration principale (appel des modules)
├── variables.tf          # Variables globales
├── outputs.tf            # Sorties globales
└── modules/
    └── scaleway_s3_bucket/     # Module pour le bucket S3
        ├── main.tf            # Ressource du bucket
        ├── variables.tf       # Variables du module
        └── outputs.tf         # Sorties du module
```

---

## ⚙️ Prérequis

1. **Terraform** installé ([téléchargement](https://developer.hashicorp.com/terraform/downloads))
2. **Compte Scaleway** avec :
   - Un **projet** créé
   - Des **clés d'API** (access_key + secret_key) générées
3. **awscli** ou **s3cmd** pour uploader les fichiers (optionnel)

---

## 🚀 Déploiement

### 1. Initialiser Terraform

```bash
cd infra
terraform init
```

### 2. Créer un fichier `terraform.tfvars`

Créez un fichier `terraform.tfvars` dans le dossier `infra/` avec vos valeurs :

```hcl
# Scaleway
scaleway_region      = "fr-par"
scaleway_zone        = "fr-par-1"
scaleway_project_id  = "votre-project-id"  # Trouvable dans le console Scaleway
scaleway_access_key  = "votre-access-key"
scaleway_secret_key  = "votre-secret-key"

# Bucket
bucket_name          = "recettes-pwa-votrenom"  # Doit être unique globalement
bucket_acl           = "public-read"
enable_versioning   = false
index_document       = "index.html"
error_document       = "index.html"
allowed_origins      = ["https://recettes.votredomaine.com", "*"]

# Environnement
environment          = "prod"
```

> ⚠️ **Ne commitez jamais ce fichier** (ajoutez-le au `.gitignore`).

### 3. Appliquer la configuration

```bash
terraform plan      # Vérifier les changements
terraform apply     # Appliquer (confirmez avec 'yes')
```

### 4. Récupérer les sorties

Après déploiement, Terraform affichera les sorties, dont :
- `website_url` : URL de votre application
- `bucket_name` : Nom du bucket S3

Vous pouvez aussi les lister plus tard avec :
```bash
terraform output
```

---

## 📂 Déploiement de l'application

### 1. Builder l'application

```bash
cd /path/to/recettes  # Dossier racine du projet
npm install
npm run build         # Génère le dossier 'dist/'
```

### 2. Uploader vers S3

#### Avec `awscli` (recommandé)

```bash
# Configurer awscli pour Scaleway
aws configure set endpoint_url https://s3.fr-par.scw.cloud
aws configure set aws_access_key_id VOTRE_ACCESS_KEY
aws configure set aws_secret_access_key VOTRE_SECRET_KEY

# Synchroniser le dossier dist/ vers le bucket
aws s3 sync ./dist/ s3://NOM_DU_BUCKET/ --endpoint-url=https://s3.fr-par.scw.cloud
```

#### Avec `s3cmd`

```bash
s3cmd --host=s3.fr-par.scw.cloud --host-bucket=s3.fr-par.scw.cloud sync ./dist/ s3://NOM_DU_BUCKET/
```

#### Via le console Scaleway

1. Allez dans **Object Storage** > votre bucket.
2. Cliquez sur **"Upload"** et sélectionnez le dossier `dist/`.

---

## 🔍 Vérification

1. **Accédez à l'URL** affichée par Terraform (`website_url`).
2. **Vérifiez l'hébergement statique** :
   - L'URL doit charger `index.html`.
   - Les routes (ex: `/recettes`) doivent fonctionner (grâce à `error_document = "index.html"`).
3. **Testez le mode hors ligne** (si PWA configurée) :
   - Ouvrez l'application dans Chrome.
   - Désactivez le réseau dans DevTools (**Network** > coche "Offline").
   - L'application doit continuer à fonctionner.

---

## 🧹 Nettoyage

Pour détruire toute l'infrastructure :

```bash
terraform destroy
```

> ⚠️ **Attention** : Cela supprimera **définivement** le bucket et son contenu.

---

## 🔧 Personnalisation

### Ajouter un CDN Scaleway

Si vous voulez ajouter un CDN devant votre bucket, créez un nouveau module dans `modules/scaleway_cdn/` et appelez-le dans `main.tf`.

### Configurer HTTPS

Scaleway S3 ne supporte pas HTTPS natif. Utilisez :
- **Cloudflare** (recommandé) : Configurez un enregistrement DNS + proxy Cloudflare.
- **Scaleway CDN** : Si vous créez un module CDN.

### Gérer plusieurs environnements

Créez des fichiers `terraform.tfvars` séparés :
- `dev.tfvars`
- `staging.tfvars`
- `prod.tfvars`

Puis appliquez avec :
```bash
terraform apply -var-file=dev.tfvars
```

---

## 📚 Documentation

- [Terraform Scaleway Provider](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs)
- [Scaleway S3 Documentation](https://www.scaleway.com/fr/docs/scaleway-object-storage/)
- [AWS CLI avec Scaleway](https://www.scaleway.com/fr/docs/scaleway-object-storage/how-to-use-awscli/)
