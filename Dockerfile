FROM node:0.12.6
MAINTAINER feng "241456911@qq.com"
WORKDIR /dockerone-crawler-server
RUN \
    rm /etc/localtime && \
    ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime 
ADD ./package.json /dockerone-crawler-server/
RUN npm install
EXPOSE 3000
ADD . /dockerone-crawler-server
CMD node index.js

