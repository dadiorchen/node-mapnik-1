const express = require("express");
const mapnik = require("../lib/mapnik");
const path = require("path");

const app = express();
app.get("/:z/:x/:y.png", async (req, res) => {
  const {x,y,z} = req.params;
  const mercator = require('./sphericalmercator')
  mapnik.register_default_fonts();
  mapnik.register_default_input_plugins();
  const map = await new Promise((res, rej) => {
    const mapInstance = new mapnik.Map(256, 256);
    const define = path.join(__dirname, '../test/postgis.xml');
    console.log("path:", define);
    mapInstance.load(define, {strict: true},function(err,_map) {
//      if (options.bufferSize) {
//        obj.bufferSize = options.bufferSize;
//      }
      res(_map);
    });
  });
  console.log("map:", map);
  console.log("x,y,z:", x,y,z);
  // bbox for x,y,z
  var bbox = mercator.xyz_to_envelope(x, y, z, false);
  map.extent = bbox;
  var im = new mapnik.Image(256, 256);
  const buffer = await new Promise((res, rej) => {
    map.render(im, function(err, im) {
      if(err) throw err;
      im.encode('png', function(err,buffer) {
        if (err) throw err;
        res(buffer);
//        fs.writeFile('/tmp/test/tile.png',buffer, function(err) {
//          if (err) throw err;
//          console.log('saved map image to map.png');
//          res();
//        });
      });
    });
  });
  res.set({'Content-Type': 'image/png'});
  res.end(buffer);

});

app.use("*", (_, res) => {
  res.status(200).send("Welcome to Greenstand tile server");
});
//app.use(async (_req, res) => {
//  // register fonts and datasource plugins
//  mapnik.register_default_fonts();
//  mapnik.register_default_input_plugins();
//
//  var map = new mapnik.Map(256*5, 256*5);
//  const buffer = await new Promise((resolve, _rej) => {
//    map.load('./test/postgis.xml', function(err,map) {
//      if (err) throw err;
//      //        expect(map).toHaveProperty("srs", "+init=epsg:3857");
//      map.zoomAll();
//      var im = new mapnik.Image(256*5, 256*5);
//      map.render(im, function(err,im) {
//        if (err) throw err;
//        im.encode('png', function(err,buffer) {
//          if (err) throw err;
//          resolve(buffer);
//          //              fs.writeFile('/tmp/test/tree.png',buffer, function(err) {
//          //                if (err) throw err;
//          //                console.log('saved map image to map.png');
//          //                res();
//          //              });
//        });
//      });
//    });
//  });
//  res.set({'Content-Type': 'image/png'});
//  res.end(buffer);
//});

module.exports = app;
