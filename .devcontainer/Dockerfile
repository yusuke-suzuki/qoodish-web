FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

# Ensure volume mount directories exist with proper permissions
RUN mkdir -p /home/node/.claude /home/node/.local/share/pnpm \
    /workspaces/qoodish-web/node_modules /workspaces/qoodish-web/.next \
    && chown -R node:node /home/node /workspaces
