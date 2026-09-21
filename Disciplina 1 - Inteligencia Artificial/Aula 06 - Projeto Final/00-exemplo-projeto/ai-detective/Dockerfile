# Imagem do app (usada na AWS pelo docker compose da EC2).
# node:22-slim (Debian) em vez de alpine: a biblioteca sharp funciona sem ajustes.
FROM node:22-slim

WORKDIR /app

# Instala TODAS as dependências (inclusive as de desenvolvimento): o `next build`
# precisa do TypeScript/Tailwind e o `npm run setup` usa o tsx.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
