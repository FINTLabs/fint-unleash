# Stage 1: Build TypeScript code
FROM node:latest AS build

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn install

COPY . .
RUN yarn build

# Stage 2: Run the built code
FROM node:latest

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production

COPY --from=build /app/dist ./dist

EXPOSE 4242

CMD node dist/index.js