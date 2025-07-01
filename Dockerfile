# Build stage
FROM node:20-alpine as build

WORKDIR /app

# Define build arguments
ARG VITE_API_BASE_URL
ARG VITE_AI_API_BASE_URL

# Set environment variables from arguments
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_AI_API_BASE_URL=$VITE_AI_API_BASE_URL

# Print variables for debug
RUN echo "Building with API URL: $VITE_API_BASE_URL"
RUN echo "Building with AI API URL: $VITE_AI_API_BASE_URL"

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy environment variables first (phải làm trước khi copy source code)
COPY .env* ./

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create directories for SSL certificates
RUN mkdir -p /etc/ssl/certs /etc/ssl/private

# Expose ports
EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"] 