const path = require("path");
const fs = require("fs");
const {config, configFreetown} = require("./config");

describe("", () => {

  beforeEach(() => {
    process.env.DB_URL = "postgresql://newuser:pppp@192.168:2222/namename?ssl=true";
  });

  it("config", async () => {
    config();
  const newDefine = path.join(__dirname, '../test/postgis.prod.xml');
    const newContent = fs.readFileSync(newDefine).toString();
    expect(newContent).toMatch(/newuser/);
    expect(newContent).toMatch(/192.168/);
    expect(newContent).toMatch(/2222/);
    expect(newContent).toMatch(/namename/);
    expect(newContent).toMatch(/ppp/);

//    const define = path.join(__dirname, 'stylesheet.xml');
//    console.log("path:", define);
//    mapInstance.load(define, {strict: true},function(err,_map) {
  });

  it.only("config freetown", async () => {
    configFreetown();
  const newDefine = path.join(__dirname, '../test/postgis.freetown.prod.xml');
    const newContent = fs.readFileSync(newDefine).toString();
    expect(newContent).toMatch(/newuser/);
    expect(newContent).toMatch(/192.168/);
    expect(newContent).toMatch(/2222/);
    expect(newContent).toMatch(/namename/);
    expect(newContent).toMatch(/ppp/);
    expect(newContent).toMatch(/getEntityRelationshipChildren/);

//    const define = path.join(__dirname, 'stylesheet.xml');
//    console.log("path:", define);
//    mapInstance.load(define, {strict: true},function(err,_map) {
  });
});
