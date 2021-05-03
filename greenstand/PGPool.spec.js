jest.mock("pg");
const PGPool = require("./PGPool");
const { Pool} = require('pg');
const log = require("loglevel");


describe("PGPool", () => {

  it("test cache size and expire", async () => {
    const query = jest.fn()
      .mockResolvedValue({
        rows: [],
      });
    Pool.mockImplementation(() => ({
      query,
    }));
    const pgPool = new PGPool({
      cacheSize: 1,
      cacheExpire: 1000,
    });
    const sql1 = "fake_sql1";
    const sql2 = "fake_sql2";
    const sql3 = "fake_sql3";
    let result = await pgPool.getQuery(sql1);
    expect(result).toBeDefined();
    result = await pgPool.getQuery(sql2);
    expect(result).toBeDefined();
    expect(pgPool.hasCached(sql1)).toBe(false);//has been squeezed out
    expect(pgPool.hasCached(sql2)).toBe(true);
    expect(pgPool.hasCached(sql3)).toBe(false);

    //jest.advanceTimersByTime(20000);
    await new Promise((res,_rej) => {
      setTimeout(() => res(), 2000);
    });
    //expired
    expect(pgPool.hasCached(sql2)).toBe(false);

  });

  it.only("the request queue", done => {
    const query1 = jest.fn();
    const query2 = jest.fn();
    const result1 = jest.fn();
    const query = jest.fn(async (q) => {
      await new Promise(res => setTimeout(() => res(), 1000));
      if(q.text === "fake_sql1"){
        log.warn("sql1");
        query1();
        return {
          rows: [{value:"fake_result1"}],
        };
      }else if(q.text === "fake_sql2"){
        log.warn("sql2");
        query2();
        return {
          rows: [{value:"fake_result2"}],
        };
      }else{
        throw new Error("not support");
      }
    });
    Pool.mockImplementation(() => ({
      query,
    }));
    const pgPool = new PGPool({
      cacheSize: 2,
      cacheExpire: 1000,
    });
    const sql1 = "fake_sql1";
    const sql2 = "fake_sql2";
    pgPool.getQuery(sql1)
      .then(result => {
        log.warn("sql1 result");
        result1();
        expect(query1).toHaveBeenCalled();
        expect(result.rows).toMatchObject([{
          value: "fake_result1",
        }]);
      });
    //delay a while
    new Promise(res => setTimeout(() => res(), 50))
    .then(() => {
      pgPool.getQuery(sql2)
        .then(result => {
          expect(result1).toHaveBeenCalled();
          expect(query2).toHaveBeenCalled();
          expect(result.rows).toMatchObject([{
            value: "fake_result2",
          }]);
          done();
        });
    });
  });

});
