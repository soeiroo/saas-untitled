FROM node:20.9.0-bullseye

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm config set maxsockets 5
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
