FROM node:20.17-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

RUN npm run build

FROM node:20.17-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

COPY --from=builder /app/drizzle ./drizzle

# Set environment variables if needed
# ENV NODE_ENV=production

EXPOSE 3030

CMD ["sh", "-c", "npm run db:migrate:prod && npm run start"]
