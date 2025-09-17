# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files for better Docker layer caching
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install root dependencies
RUN npm install

# Install backend dependencies
WORKDIR /app/backend
RUN npm install

# Install frontend dependencies
WORKDIR /app/frontend
RUN npm install

# Go back to app root
WORKDIR /app

# Copy source code
COPY . .

# Build frontend with production environment variables
WORKDIR /app/frontend
RUN npm run build:prod

# Go back to app root for startup
WORKDIR /app

# Expose port
EXPOSE 5010

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5010

# Start the application
CMD ["npm", "start"]
