const mapnik = require('mapnik');
const fs = require('fs');
const log = require("loglevel");

describe("sheet", () => {

  it("world map", async () => {

    // register fonts and datasource plugins
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();

    var map = new mapnik.Map(256, 256);
    const r = await new Promise((res, rej) => {
      map.load('./test/stylesheet.xml', function(err,map) {
        if (err) throw err;
        map.zoomAll();
        var im = new mapnik.Image(256, 256);
        map.render(im, function(err,im) {
          if (err) throw err;
          im.encode('png', function(err,buffer) {
            if (err) throw err;
            fs.writeFile('/tmp/test/map.png',buffer, function(err) {
              if (err) throw err;
              console.log('saved map image to map.png');
              res();
            });
          });
        });
      });
    });
  });

  it("version", async () => {
    log.warn("mapnik:", mapnik);
    expect(mapnik).toHaveProperty("version", "4.5.6");
    expect(mapnik.versions).toHaveProperty("mapnik", "4.0.0");
    var map = new mapnik.Map(25, 25, '+init=epsg:3857');
    console.log(map);
    log.warn("map:", map);
    log.warn("map2:", JSON.stringify(map, undefined, 2));
    console.log(JSON.parse(JSON.stringify(map)));
    expect(map).toHaveProperty("load", expect.any(Function));
    expect(map).toHaveProperty("width", expect.any(Number));
    expect(map).toHaveProperty("srs", "+init=epsg:3857");
    expect(map).toHaveProperty("extent");
  });

  it.only("trees table map", async () => {

    // register fonts and datasource plugins
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();

    var map = new mapnik.Map(256*5, 256*5);
    const r = await new Promise((res, rej) => {
      map.load('./test/postgis.xml', function(err,map) {
        if (err) throw err;
//        expect(map).toHaveProperty("srs", "+init=epsg:3857");
        map.zoomAll();
        var im = new mapnik.Image(256*5, 256*5);
        map.render(im, function(err,im) {
          if (err) throw err;
          im.encode('png', function(err,buffer) {
            if (err) throw err;
            fs.writeFile('/tmp/test/tree.png',buffer, function(err) {
              if (err) throw err;
              console.log('saved map image to map.png');
              res();
            });
          });
        });
      });
    });
  });
});
