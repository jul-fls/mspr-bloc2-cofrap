# Stage 1: Build the app
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
# Copy only files needed for install first (for caching)
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Set environment variables if needed
ARG VITE_FUNCTIONS_URL
ENV VITE_FUNCTIONS_URL=$VITE_FUNCTIONS_URL

# Build the app (will use the env var)
RUN pnpm build

# Stage 2: Serve the app using a minimal web server (nginx)
FROM nginx:stable-alpine AS production

# Remove default nginx static content
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: custom nginx config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the default HTTP port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
