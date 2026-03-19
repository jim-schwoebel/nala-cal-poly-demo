FROM node:20-slim

WORKDIR /app

# Copy workspace root package files
COPY package.json package-lock.json ./

# Copy shared types
COPY shared/ shared/

# Copy client package
COPY client/package.json client/
COPY client/tsconfig.json client/
COPY client/vite.config.ts client/

# Install all workspace dependencies
RUN npm install --workspace=client --workspace=shared

# Copy client source
COPY client/src/ client/src/
COPY client/index.html client/

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace=client"]
