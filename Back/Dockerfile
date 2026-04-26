# Dockerfile - Backend Node.js

# Choisir l'image de base légère
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le code source
COPY . .

# Exposer le port
EXPOSE 8801

# Démarrer l'application
CMD ["npm", "start"]
