FROM node:22-alpine

WORKDIR /app

# Install dependencies first (for docker caching)
COPY package*.json ./
RUN npm install --production

# Copy all source files
COPY . .

EXPOSE 5000

# Start server
CMD ["npm", "start"]
