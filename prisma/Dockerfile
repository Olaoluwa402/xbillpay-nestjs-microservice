FROM node:alpine As development

WORKDIR /usr/src/app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the Prisma service code into the container
COPY . .

# Command to run Prisma migration
CMD ["npx", "prisma", "migrate", "deploy", "--preview-feature"]
