FROM dadiorchen/tile2:first
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY . ./
RUN sudo apt install build-essential 
RUN sudo apt-get install zlib1g-dev
RUN make release_base
CMD [ "npm", "start" ]
