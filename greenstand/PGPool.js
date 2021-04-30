const { Pool} = require('pg');
const log = require("loglevel");

class PGPool{

  constructor(){
    this.cache = {};
    this.pool = new Pool({ connectionString: process.env.DB_URL });
    this.queue = [];
    this.isFetching = false;
  }

  fetch(sql, callback){
    log.warn("fetch");
    this.queue.push(callback);
    if(this.isFetching){
      log.warn("is fetching, queue");
    }else{
      this.isFetching = true;
      this.pool.query({
        text: sql,
        values:[]
      }).then(result => {
        log.warn("get from db");
        while(this.queue.length > 0){
          const cb = this.queue.pop();
          cb(result);
        }
        this.cache[sql] = result;
        this.isFetching = false;
        log.warn("fetch finished");
      });
    }
  }

  getQuery(sql){
    log.info("get query");
    return new Promise((res, rej) => {
      if(this.cache[sql]){
        log.warn("cache bingo!");
        //TODO expire the cache
        res(this.cache[sql]);
      }else{
        this.fetch(sql,(result)=>{
          log.warn("fetch callback");
          res(result);
        });
      }
    });
  }
}

module.exports = PGPool;
