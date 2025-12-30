# ---- Build Stage ----
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i; \
  else npm i; fi

COPY . .

RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --omit=dev; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm i --prod; \
  else npm i --omit=dev; fi

COPY --from=build /app/build ./build

EXPOSE 3000

CMD ["node", "build"]