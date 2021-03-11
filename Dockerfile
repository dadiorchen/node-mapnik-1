FROM dadiorchen/tile2:first
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . ./
RUN sudo apt install build-essential 
RUN sudo apt-get install zlib1g-dev
#TODO We should build the tile2 image from node 12 alpine
RUN curl -fsSL https://deb.nodesource.com/setup_12.0 | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN make release
CMD [ "npm", "start" ]
