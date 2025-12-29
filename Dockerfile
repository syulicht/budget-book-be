FROM node:20

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript and remove dev dependencies
RUN npm run build && npm prune --omit=dev

# Expose port
EXPOSE 3000

# Start application
CMD ["npx prisma migrate deploy && node dist/server.js"]
