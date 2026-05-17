FROM node:18-alpine AS build

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (une seule commande)
RUN npm install --legacy-peer-deps

# Copier tout le code source
COPY . .

# Construire l'application
RUN npm run build

# Étape 2 : Serveur nginx
FROM nginx:alpine

# Copier les fichiers construits vers nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port 80
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]
