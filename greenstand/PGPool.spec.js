jest.mock("pg");
const PGPool = require("./PGPool");
const { Pool} = require('pg');


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
});
