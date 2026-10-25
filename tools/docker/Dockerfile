# The image the apps run in under `docker compose`: Node, as `.nvmrc` names
# it, and the pnpm of `packageManager`. The checkout is bind-mounted over
# /app at run time, node_modules included, so the image copies nothing and
# installs nothing; `pnpm install` runs on the host. The image is Debian,
# not Alpine, so the native binaries pnpm installed on a glibc host run in
# it. Who the apps run as is `compose.yaml`'s.
FROM node:24-bookworm-slim

RUN npm install -g pnpm@10.27.0 && npm cache clean --force

WORKDIR /app
