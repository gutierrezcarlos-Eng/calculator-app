# Stage 1: build the React app
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_API_BASE=http://backend:8080
ARG VITE_API_PREFIX=/api/v1
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_API_PREFIX=$VITE_API_PREFIX
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]