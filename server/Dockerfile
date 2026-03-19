FROM node:20-slim

WORKDIR /app

# Copy workspace root package files
COPY package.json package-lock.json ./

# Copy shared types
COPY shared/ shared/

# Copy server package
COPY server/package.json server/
COPY server/tsconfig.json server/

# Install all workspace dependencies
RUN npm install --workspace=server --workspace=shared

# Copy server source
COPY server/src/ server/src/

EXPOSE 3001

CMD ["npm", "run", "dev", "--workspace=server"]
