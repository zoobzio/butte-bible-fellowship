.PHONY: help install dev build generate preview lint lint-fix typecheck test test-watch coverage check ci clean

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

lint: ## Run ESLint
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

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
	rm -rf node_modules/.cache
	rm -rf .coverage
	rm -rf .nuxt .output
