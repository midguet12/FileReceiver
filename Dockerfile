FROM node:20.11.1
WORKDIR /usr/app
COPY ./ /usr/app
RUN npm install
EXPOSE 3005
CMD ["npm", "start"]