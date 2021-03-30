const XMLConfig = require("./XMLConfig");
const log = require("loglevel");


describe("XML config", () => {

  it("change sql", async () => {
    const xmlConfig = new XMLConfig(); 
    await xmlConfig.select(`select * from tree2`);
    const string = await xmlConfig.toString();
    expect(string).toMatch(/select.*tree2/is);
  });
});
