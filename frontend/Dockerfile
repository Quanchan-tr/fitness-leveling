FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm install

# Copy application source code
COPY . .

EXPOSE 3000

# Default to dev server with hot reload; can be overridden in docker-compose
CMD ["npm", "run", "dev"]
