FROM node:14-bullseye

WORKDIR /app

ARG NODE_ENV=production 
ENV NODE_ENV=$NODE_ENV

# ARG API_URL=api.tca.sk
# ENV API_URL=$API_URL

# RUN npm i -g strapi nodemon
# RUN npm install -g node-pre-gyp
# RUN npm install -g concurrently


COPY package.json .
# COPY yarn.lock .

RUN npm install
RUN npm audit fix

COPY . .

# Install plugins

# Build admin
RUN npm run build --clean
EXPOSE 1337

CMD ["yarn", "start"]