# multi-stage Dockerfile for Vite React app

# 1. build stage
FROM node:18-alpine AS build
WORKDIR /app

# install dependencies first to leverage caching
COPY package.json package-lock.json* ./
RUN npm ci

# copy rest of the sources
COPY . .

# build
RUN npm run build

# 2. production stage
FROM nginx:alpine

# copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# default nginx config works for SPA; could add custom conf here if needed

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]