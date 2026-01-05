ARG NODE_VERSION

FROM harbor2.o.kg/public/node:$NODE_VERSION as build-stage
WORKDIR /app

COPY . .

RUN npm install

RUN npm run build-only

FROM harbor2.o.kg/public/nginx:1.25.2-alpine
COPY .builder/configs/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html/
