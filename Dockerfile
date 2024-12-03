# Stage 1: Build
FROM node:22-alpine
# Set working directory
WORKDIR src/app
# Copy package.json and package-lock.json
COPY package*.json ./
# Install dependencies
RUN npm install
# Copy the rest of the application source code
COPY . .
# Expose port 80
EXPOSE 80