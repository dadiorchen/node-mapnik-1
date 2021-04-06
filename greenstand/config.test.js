jest.mock("pg");
const path = require("path");
const fs = require("fs");
const {config, configFreetown, getXMLString} = require("./config");
const xml = require("./xml");
const { Pool} = require('pg');


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

  it("config freetown", async () => {
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

describe.only("getXMLString", () => {

  describe("basic", () => {

    it("basic", async () => {
      const xmlString = await getXMLString({
        zoomLevel: 2,
      });
      expect(xmlString).toMatch(/case1/s);
    });

    it("level 12", async () => {
      const xmlString = await getXMLString({
        zoomLevel: 12,
      });
      expect(xmlString).toMatch(/case4/s);
    });

    it("level 16", async () => {
      const xmlString = await getXMLString({
        zoomLevel: 16,
      });
      expect(xmlString).toMatch(/case2/s);
    });
  });

  describe("useid", () => {

    it("basic, count = 10", async () => {
      const query = jest.fn()
        .mockResolvedValue({
          rows: [{
            count: 10,
          }],
        });
      Pool.mockImplementation(() => ({
        query,
      }));
      const xmlString = await getXMLString({
        zoomLevel: 2,
        userid: 1,
      });
      expect(xmlString).toMatch(/case3/s);
    });

    it("count = 5000", async () => {
      const query = jest.fn()
        .mockResolvedValue({
          rows: [{
            count: 5000,
          }],
        });
      Pool.mockImplementation(() => ({
        query,
      }));
      const xmlString = await getXMLString({
        zoomLevel: 2,
        userid: 1,
      });
      expect(xmlString).toMatch(/case1/s);
    });

  });



});

