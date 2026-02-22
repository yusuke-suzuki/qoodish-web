FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install-sdk#deb
RUN apt-get update && apt-get install -y apt-transport-https ca-certificates gnupg curl \
    && curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list \
    && apt-get update && apt-get install -y google-cloud-cli \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure volume mount directories exist with proper permissions
RUN mkdir -p /home/node/.local/share/pnpm \
    /workspaces/qoodish-web/node_modules /workspaces/qoodish-web/.next \
    && chown -R node:node /home/node /workspaces
