const express = require("express");
const mapnik = require("../lib/mapnik");
const path = require("path");
const log = require("loglevel");
const cors = require("cors");
const {getXMLString} = require("./config");
const fs = require("fs");
const {setSql} = require("./utils");


//font
mapnik.register_default_fonts();
mapnik.register_default_input_plugins();
log.warn("fonts:", mapnik.fonts());
const mapInstance = new mapnik.Map(256, 256);
mapInstance.registerFonts(path.join(__dirname, '../test/data/map-a/'), {recurse:true});
log.warn("font instance:", mapInstance.fonts());
mapnik.Logger.setSeverity(mapnik.Logger.DEBUG);
log.warn("log level of mapnik:", mapnik.Logger.getSeverity());
const mercator = require('./sphericalmercator')

const app = express();
app.use(cors());

//viewer
const viewer = path.join(__dirname, './examples/viewer');
//app.get('/viewer', function(req, res) {
//    res.sendFile(path.join(viewer, 'index.html'));
//});
app.use('/viewer', express.static(viewer));
const images = path.join(__dirname, './examples/viewer/images');
app.use('/viewer/images', express.static(images));


async function buildMapInstance(x, y, z, params){
  const map = await new Promise(async (res, rej) => {
    const mapInstance = new mapnik.Map(256, 256);
    mapInstance.registerFonts(path.join(__dirname, '../test/data/map-a/'), {recurse:true});

    const bboxDb = mercator.xyz_to_envelope_db_buffer(//x, y, z, false);
      parseInt(x),
      parseInt(y),
      parseInt(z), 
      false,
      100,
    );
    const bounds = bboxDb.join(",");
    log.warn("bounds:", bounds);
    const xmlString = await getXMLString({
      zoomLevel: z,
      bounds,
      ...params,
    });

    mapInstance.fromString(xmlString, {
      strict: true,
      base: __dirname,
    },function(err,_map) {
      if(err){
        console.error("e:", err);
        throw "failed";
      }
      //      if (options.bufferSize) {
      //        obj.bufferSize = options.bufferSize;
      //      }
      res(_map);
    });
  });
  console.log("map:", map);
  console.log("x,y,z:", x,y,z);
  // bbox for x,y,z
  const bbox = mercator.xyz_to_envelope(//x, y, z, false);
    parseInt(x),
    parseInt(y),
    parseInt(z), false);
  console.log("bbox:", bbox);
  //map.zoomAll();
  map.extent = bbox;
  console.log("map:", map);
  console.log("map extent:", map.extent);
  console.log("map.zoomAll:", map.zoomAll);
  console.log("map.zoomToBox:", map.zoomToBox);
  console.log("map.load:", map.load);
  console.log("map.scale:", map.scale());
  console.log("map.scaleDenominator:", map.scaleDenominator());
  return map;
}

app.get("/:z/:x/:y.png", async (req, res) => {
  const {x,y,z} = req.params;
  let begin = Date.now();
  const map = await buildMapInstance(x, y, z, req.query);
  log.warn("build map took:", Date.now() - begin, x,y,z,".png");
  begin = Date.now();
  const im = new mapnik.Image(256, 256);
  const buffer = await new Promise((res, rej) => {
    map.render(im, function(err, im) {
      if(err) throw err;
      im.encode('png', function(err,buffer) {
        if (err) throw err;
        res(buffer);
      });
    });
  });
  log.warn("render map took:", Date.now() - begin, x,y,z,".png");
  res.set({'Content-Type': 'image/png'});
  res.end(buffer);

});

app.get("/:z/:x/:y.grid.json", async (req, res) => {
  const {x,y,z} = req.params;
  let begin = Date.now();
  const map = await buildMapInstance(x, y, z, req.query);
  log.warn("build map took:", Date.now() - begin, x,y,z,".grid");
  begin = Date.now();
  var grid = new mapnik.Grid(256, 256);
  const fields = ["id", "latlon", "count", "type"];
  if(parseInt(z) <= 9){
    fileds.push("zoom_to");
  }
  const json = await new Promise((res, _rej) => {
    map.render(
      grid, {
        layer:"l1", 
        fields,
      }, function(err, grid) {
      if (err) throw err;
      console.log(grid);
      const json = grid.encodeSync({resolution: 4, features: true});
      res(json);
    });
  });
  log.warn("render map took:", Date.now() - begin, x,y,z,".grid");
  res.set({'Content-Type': 'application/json'});
  res.json(json);
});


app.use("*", (_, res) => {
  res.status(200).send("Welcome to Greenstand tile server");
});

module.exports = app;
