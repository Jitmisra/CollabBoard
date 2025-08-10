# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Build frontend with production environment variables
RUN cd frontend && npm run build:prod

# Expose port
EXPOSE 5010

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5010

# Start the application
CMD ["npm", "start"]
