FROM mcr.microsoft.com/devcontainers/typescript-node:22-bookworm

# Ensure Claude Code directory exists with proper permissions
RUN mkdir -p /home/node/.claude && chown -R node:node /home/node/.claude
