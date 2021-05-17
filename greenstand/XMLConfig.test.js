const XMLConfig = require("./XMLConfig");
const log = require("loglevel");


describe("XML config", () => {

  it("change sql", async () => {
    const xmlConfig = new XMLConfig(); 
    xmlConfig.select(`select * from tree2`);
    expect(xmlConfig.toString()).toMatch(/select.*tree2/is);
  });
});
