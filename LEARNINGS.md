# 📚 Learnings & Bonnes Pratiques Terraform

Ce fichier recense les **erreur courantes**, **bonnes pratiques** et **astuces** rencontrées lors du développement de l'infrastructure Terraform pour le projet **Recettes PWA**.

---

## 🔴 Erreurs Courantes

### 1. **Provider Scaleway non configuré dans les modules**
**Problème** :
Si un module Terraform utilise des ressources Scaleway (ex : `scaleway_object_bucket`), mais que le bloc `terraform { required_providers { ... } }` est **absent du module**, Terraform ne saura pas quel provider utiliser.

**Symptômes** :
```
Error: operation error S3: CreateBucket, get identity: failed to refresh cached credentials, static credentials are empty
```

**Solution** :
✅ **Toujours ajouter ce bloc au début de chaque module** qui utilise des ressources Scaleway :
```hcl
terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
}
```

> ⚠️ **Pourquoi ?**
> - Terraform a besoin de savoir **quel provider** utiliser pour les ressources du module.
> - Même si le provider est déjà configuré dans le `main.tf` parent, **chaque module doit déclarer ses dépendances**.
> - Cela permet aussi à Terraform de **télécharger automatiquement** le provider si nécessaire.

---

### 2. **Bloc `website {}` dans `scaleway_object_bucket`**
**Problème** :
Contrairement à AWS S3, **Scaleway ne supporte pas** le bloc `website {}` directement dans la ressource `scaleway_object_bucket`.

**Symptômes** :
- Terraform applique sans erreur, mais **l’hébergement statique ne fonctionne pas** (le bucket ne sert pas `index.html` par défaut).
- L’URL du bucket ne charge pas comme un site web.

**Solution** :
✅ **Utiliser la ressource dédiée** `scaleway_object_bucket_website_configuration` :
```hcl
# ❌ À NE PAS FAIRE (ne fonctionne pas avec Scaleway)
resource "scaleway_object_bucket" "mon_bucket" {
  name = "mon-bucket"
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
}

# ✅ CORRECT : Utiliser la ressource séparée
resource "scaleway_object_bucket" "mon_bucket" {
  name = "mon-bucket"
}

resource "scaleway_object_bucket_website_configuration" "mon_bucket" {
  bucket = scaleway_object_bucket.mon_bucket.name
  index_document = "index.html"
  error_document = "error.html"
}
```

**Référence** : [Documentation officielle](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/object_bucket_website_configuration)

---

### 3. **Format de l’URL de l’hébergement statique**
**Problème** :
Le format de l’URL pour accéder au bucket en mode hébergement statique **n’est pas standard** chez Scaleway.

**Symptômes** :
- L’output `website_endpoint` est incorrect ou vide.
- Impossible d’accéder au site via l’URL générée.

**Solution** :
✅ **Le format correct est** :
```
{bucket_name}.website.{region}.scw.cloud
```

Exemple :
```hcl
output "bucket_website_url" {
  value = "https://${scaleway_object_bucket.mon_bucket.name}.website.${scaleway_object_bucket.mon_bucket.region}.scw.cloud"
}
```

> ⚠️ **Note** :
> - Ce format est **spécifique à Scaleway** (AWS utilise `{bucket}.s3-website-{region}.amazonaws.com`).
> - Vérifiez toujours la [documentation Scaleway](https://www.scaleway.com/fr/docs/scaleway-object-storage/how-to/host-static-website/) pour les mises à jour.

---

### 4. **Variables sensibles dans `terraform.tfvars`**
**Problème** :
Les clés d’API (`scaleway_access_key`, `scaleway_secret_key`) sont **sensibles** et ne doivent **jamais être commitées** dans Git.

**Symptômes** :
- Fichier `terraform.tfvars` commité par erreur.
- Risque de fuite de credentials.

**Solution** :
✅ **Toujours ajouter `terraform.tfvars` au `.gitignore`** :
```bash
echo "terraform.tfvars" >> .gitignore
echo "*.tfvars" >> .gitignore  # Pour tous les fichiers .tfvars
git add .gitignore
git commit -m "Add tfvars to gitignore"
```

✅ **Alternatives pour les environnements de production** :
1. **Variables d’environnement** (recommandé) :
   ```bash
   export TF_VAR_scaleway_access_key="..."
   export TF_VAR_scaleway_secret_key="..."
   terraform apply
   ```
2. **Fichier `~/.config/scaleway/config.yaml`** (pour `scw` CLI) :
   ```yaml
   access_key: votre-clé
   secret_key: votre-secret
   default_project_id: votre-project-id
   ```
   Terraform utilisera automatiquement ce fichier si `scw` est installé.

---

## ✅ Bonnes Pratiques

### 1. **Structure des modules**
**Organisation recommandée** :
```
infra/
├── main.tf               # Appel des modules + configuration globale
├── variables.tf          # Variables globales
├── outputs.tf            # Sorties globales
└── modules/
    └── scaleway_s3_bucket/
        ├── main.tf        # Ressources du module
        ├── variables.tf   # Variables du module
        └── outputs.tf     # Sorties du module
```

**Pourquoi ?**
- **Modularité** : Chaque composant (bucket, CDN, base de données) est isolé dans son module.
- **Réutilisabilité** : Un module peut être réutilisé dans d’autres projets.
- **Lisibilité** : Le code est plus facile à maintenir.

---

### 2. **Déclarer les `required_providers` dans chaque module**
**Règle** : **Toujours** ajouter ce bloc au début de chaque module :
```hcl
terraform {
  required_providers {
    scaleway = {
      source = "scaleway/scaleway"
    }
  }
}
```

**Avantages** :
- Terraform sait **quel provider** utiliser pour les ressources du module.
- **Téléchargement automatique** du provider si nécessaire.
- **Clarté** : Les dépendances du module sont explicites.

---

### 3. **Utiliser des `outputs` utiles**
**Exemple** :
```hcl
output "website_url" {
  description = "URL complète de l'application déployée"
  value       = "https://${scaleway_object_bucket.static_website.name}.website.${scaleway_object_bucket.static_website.region}.scw.cloud"
}
```

**Pourquoi ?**
- Permet de **récupérer facilement** les informations après déploiement (`terraform output`).
- Utile pour les **intégrations CI/CD** ou les scripts post-déploiement.

---

### 4. **Documenter les modules**
**Bonnes pratiques** :
- Ajouter un **README.md** dans chaque module pour expliquer son rôle.
- **Commenter le code** Terraform (ex : `# Configuration CORS pour permettre les requêtes depuis ton domaine`).
- **Lier la documentation officielle** (ex : `# Voir : https://registry.terraform.io/providers/scaleway/scaleway/latest/docs/resources/object_bucket`).

---

### 5. **Gérer les environnements (dev/staging/prod)**
**Méthode recommandée** :
1. **Fichiers `tfvars` séparés** :
   ```bash
   infra/
   ├── dev.tfvars
   ├── staging.tfvars
   └── prod.tfvars
   ```
2. **Appeler Terraform avec le bon fichier** :
   ```bash
   terraform apply -var-file=dev.tfvars
   ```
3. **Utiliser des workspaces Terraform** (optionnel) :
   ```bash
   terraform workspace new dev
   terraform workspace select dev
   terraform apply
   ```

---

## 🔧 Astuces

### 1. **Vérifier la syntaxe avant d’appliquer**
```bash
terraform validate  # Vérifie la syntaxe HCL
terraform fmt       # Formate le code
terraform plan      # Affiche les changements sans appliquer
```

### 2. **Debugger les problèmes de provider**
```bash
TF_LOG=debug terraform plan 2>&1 | grep -i "provider\|credential\|error"
```

### 3. **Forcer le rafraîchissement des credentials**
Si Terraform ne voit pas tes nouvelles credentials :
```bash
rm -rf .terraform/providers/  # Supprime les providers cachés
terraform init                # Réinitialise
```

### 4. **Utiliser `terraform output` pour récupérer des infos**
```bash
terraform output website_url   # Affiche l'URL du site
terraform output -json        # Affiche toutes les sorties en JSON
```

---

## 📚 Ressources Utiles

### Documentation Officielle
- [Terraform Scaleway Provider](https://registry.terraform.io/providers/scaleway/scaleway/latest/docs)
- [Scaleway Object Storage (S3)](https://www.scaleway.com/fr/docs/scaleway-object-storage/)
- [Hébergement statique avec Scaleway S3](https://www.scaleway.com/fr/docs/scaleway-object-storage/how-to/host-static-website/)

### Outils Complémentaires
- [AWS CLI avec Scaleway](https://www.scaleway.com/fr/docs/scaleway-object-storage/how-to-use-awscli/) (pour uploader les fichiers)
- [s3cmd](https://s3tools.org/s3cmd) (alternative à AWS CLI)

---

## 📝 Historique des Corrections

| Date       | Problème | Solution | Issue/Référence |
|------------|----------|----------|-----------------|
| 2024-08-23 | `website {}` dans `scaleway_object_bucket` | Utiliser `scaleway_object_bucket_website_configuration` | [#3](https://github.com/goossaertcosyn/recettes/issues/3) |
| 2024-08-23 | Provider non déclaré dans le module | Ajouter `required_providers` | Ce document |
