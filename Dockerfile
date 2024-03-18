# Build Stage
FROM node:20-alpine AS builder


RUN mkdir -p /unleash && \
    chown -R node:node /unleash && \
    yarn config set loglevel "error"

WORKDIR /unleash

ADD package.json .
ADD yarn.lock .
ADD .yarnrc.yml .

RUN corepack enable

# RUN yarn policies set-version stable
RUN yarn install --immutable

ADD . .

# RUN yarn policies set-version stable
RUN yarn build

RUN rm -rf node_modules
RUN yarn cache clean

# RUN yarn set version stable

RUN yarn workspaces focus --production

# Stage 2: Run the built code
# Production Stage
FROM gcr.io/distroless/nodejs20-debian11

LABEL org.opencontainers.image.source=https://github.com/FINTLabs/fint-unleash
LABEL org.opencontainers.image.description="Unleash for FLAIS"
LABEL org.opencontainers.image.licenses=MIT

WORKDIR /app

COPY --from=builder /unleash/dist ./dist
COPY --from=builder /unleash/node_modules ./node_modules

CMD ["dist/index.js"]