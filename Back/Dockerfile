# Dockerfile - Backend Node.js
FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances (sans nodemon global)
RUN npm install

# Copier tout le code source
COPY . .

# Exposer le port
EXPOSE 8801

# Démarrer avec node directement (pas nodemon)
CMD ["node", "index.js"]
