FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

ARG APP_PORT=3000
ENV APP_PORT=$PORT
EXPOSE $APP_PORT

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm run start"]
