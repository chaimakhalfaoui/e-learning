FROM node:18-alpine AS build

WORKDIR /app

# Copier package files
COPY package*.json ./

# Installer les dépendances
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copier le code source
COPY . .

# Build
RUN DISABLE_ESLINT_PLUGIN=true npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
