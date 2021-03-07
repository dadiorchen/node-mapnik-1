const knex = require("knex");
//const jsonData = require("./trees_sample.json");
const jsonData = require("./trees.json");
const expectRuntime = require("expect-runtime");

describe("seed", () => {

  it("seed", async () => {
    const db = knex({
      client: "pg",
      connection: {
        host : '172.17.0.4',
        port: 5432,
        user : 'postgres',
        password : 'greenstand',
        database : 'treetracker'
      },
    });
    await db("trees3").del();
    expect(jsonData).toHaveProperty("features");
    let count = 0;
    for(const feature of jsonData.features){
      if(count++ % 1000 === 0){
        console.log("count:", count);
      }
      if(count > 10000){
        break;
      }
      const [lat,lng] = feature.geometry.coordinates;
      expectRuntime(lat).a("number");
      expectRuntime(lng).a("number");
      await db("trees3").insert({
        lat:lng,
        lon:lat,
      });
    }
    await db.raw("UPDATE trees3 SET estimated_geometric_location = ST_SetSRID(ST_MakePoint(lon, lat), 4326);");
  }, 1000*60*5);

});
