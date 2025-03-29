FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install marked dompurify jsdom

# Instalar eslint globalmente
RUN npm install -g eslint

COPY . .

EXPOSE 3000

CMD ["npm", "start"]