.PHONY: help install dev build generate preview up down reset psql lint lint-fix format format-check typecheck test test-watch coverage check ci clean infra-init infra-plan infra-test infra-apply

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	pnpm install

dev: ## Start the Nuxt dev server
	pnpm dev

build: ## Build the app
	pnpm build

generate: ## Generate the static site
	pnpm generate

preview: ## Preview the production build
	pnpm preview

up: install ## Start Postgres, the site and the admin app together in Docker
	docker compose up --build

down: ## Stop the Docker environment
	docker compose down

reset: ## Stop the Docker environment and drop its database
	docker compose down --volumes

psql: ## Open psql on the Docker Postgres
	docker compose exec db psql -U postgres -d bbf

lint: ## Run oxlint
	pnpm lint

lint-fix: ## Run oxlint with auto-fix
	pnpm lint:fix

format: ## Format with oxfmt
	pnpm format

format-check: ## Check formatting with oxfmt
	pnpm format:check

typecheck: ## Run type checking
	pnpm typecheck

test: ## Run all tests
	pnpm test

test-watch: ## Run tests in watch mode
	pnpm test:watch

coverage: ## Run tests with coverage report
	pnpm test:coverage

check: lint typecheck test ## Run lint, typecheck, and tests

ci: clean install check coverage ## Full CI simulation

clean: ## Remove generated files
	rm -rf node_modules/.cache apps/*/node_modules/.cache integrations/*/node_modules/.cache
	rm -rf apps/*/.coverage integrations/*/.coverage
	rm -rf apps/*/.nuxt apps/*/.output integrations/*/.nuxt
	rm -rf .turbo apps/*/.turbo packages/*/.turbo integrations/*/.turbo

infra-init: ## Install the Terraform providers
	cd infra && terraform init

infra-plan: ## Show what Terraform would change
	cd infra && terraform plan

infra-test: ## Run the Terraform tests against mock providers
	cd infra && terraform test

infra-apply: ## Apply the infrastructure
	cd infra && terraform apply
