# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# `next build` importa (para el trazado de páginas) el módulo que crea el
# cliente de Supabase a nivel de módulo, así que necesita ver *algo* en estas
# env vars aunque sea falso — el valor real lo pone docker-compose en runtime
# vía env_file, y como no son NEXT_PUBLIC no quedan inlineados en el bundle.
ARG NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
ARG SUPABASE_SERVICE_ROLE_KEY=placeholder-service-role-key
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Salida standalone: server.js + solo los node_modules que realmente usa,
# más los assets estáticos y public/ que ese server no copia automáticamente.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3002

CMD ["node", "server.js"]
