FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install --force
RUN npm install @fortawesome/fontawesome-free chart.js react-chartjs-2
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
