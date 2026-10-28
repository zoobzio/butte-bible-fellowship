# Use Debian, not Alpine. Native binaries from the glibc host must run here.
FROM node:24-bookworm-slim

RUN npm install -g pnpm@10.27.0 && npm cache clean --force

WORKDIR /app
