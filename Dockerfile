# --- Stage 1: Build ---
FROM node:18-alpine AS builder
# Install necessary tools for building (Prisma needs openssl)
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy dependency files first (best practice for caching)
COPY package*.json ./
COPY src/prisma ./src/prisma
RUN npm install
COPY . .

# Build the app and generate Prisma client
RUN npx nx build api --configuration=production
RUN npx prisma generate --schema=./src/prisma/schema.prisma

# --- Stage 2: Runtime ---
FROM node:18-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Copy built files from the builder stage
COPY --from=builder /app/dist/api .
# Copy only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

EXPOSE 3000
CMD ["node", "main.js"]
