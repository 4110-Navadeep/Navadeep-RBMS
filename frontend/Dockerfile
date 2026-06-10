# Step 1: Build assets
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Step 2: Host using Nginx
FROM nginx:alpine

# Copy built bundle from previous stage
COPY --from=build /app/dist /usr/share/nginx/html

# Overwrite nginx default conf to redirect non-file routes to index.html (SPA support)
RUN echo 'server { \
    listen 3000; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
