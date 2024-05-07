FROM node:alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Copy Prisma schema and generate Prisma Client
COPY ./prisma ./prisma
RUN npx prisma generate

# Copy the rest of the application code

COPY . .

RUN npm run build 

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/transferservice/main"]