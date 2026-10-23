terraform {
  required_version = ">= 1.10"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 5.24"
    }
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.18"
    }
    postgresql = {
      source  = "cyrilgdn/postgresql"
      version = "~> 1.27"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.9"
    }
  }

  # State is local until a backend is chosen. See README.md, "State".
  # backend "s3" {}
}
