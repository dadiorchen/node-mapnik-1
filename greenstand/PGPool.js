const { Pool} = require('pg');
const log = require("loglevel");
const LRU = require("lru-cache");

class PGPool{
  
  /*
   * Options:
   *  cacheSize: the size of the LRU cache
   *  cacheExpire: the time to expire
   */
  constructor(options){
    this.options = {
      ...{ cacheSize: 10000, cacheExpire: 1000 * 60 * 4, }, ...options, };
    log.warn("set the pg pool by:", this.options); this.cache = new LRU({
      max: this.options.cacheSize,
      maxAge: this.options.cacheExpire,
    });
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
        this.cache.set(sql,result);
        this.isFetching = false;
        log.warn("fetch finished");
      });
    }
  }

  getQuery(sql){
    log.info("get query");
    return new Promise((res, rej) => {
      const value = this.cache.get(sql);
      if(value){
        log.warn("cache bingo!");
        //TODO expire the cache
        res(value);
      }else{
        this.fetch(sql,(result)=>{
          log.warn("fetch callback");
          res(result);
        });
      }
    });
  }

  hasCached(sql){
    const value = this.cache.get(sql);
    if(value){
      return true;
    }else{
      return false;
    }
  }
}

module.exports = PGPool;
