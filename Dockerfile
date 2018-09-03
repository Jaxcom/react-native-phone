FROM node:10

RUN mkdir /src

WORKDIR /src
ADD ./backend /src
RUN yarn

EXPOSE 3000

WORKDIR /src

CMD yarn start
