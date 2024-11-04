FROM node:20.11.1
RUN npm install
EXPOSE 3005
CMD ["npm", "start"]