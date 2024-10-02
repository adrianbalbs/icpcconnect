FROM node:20.17-alpine


WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./

COPY drizzle ./drizzle/

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate:prod && npm run start"]
