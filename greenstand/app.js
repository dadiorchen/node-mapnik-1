const express = require("express");
const mapnik = require("../lib/mapnik");
const path = require("path");
const log = require("loglevel");
const cors = require("cors");
const {config, configFreetown} = require("./config");

config();
configFreetown();

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

app.get("/:z/:x/:y.png", async (req, res) => {
  const {x,y,z} = req.params;
  const mercator = require('./sphericalmercator')
  mapnik.register_default_fonts();
  mapnik.register_default_input_plugins();
  const map = await new Promise((res, rej) => {
    const mapInstance = new mapnik.Map(256, 256);
    const define = path.join(__dirname, '../test/postgis.prod.xml');
//    const define = path.join(__dirname, 'stylesheet.xml');
    console.log("path:", define);
    mapInstance.load(define, {strict: true},function(err,_map) {
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
        console.log("map.sacle:", map.scale());
        console.log("map.scaleDenominator:", map.scaleDenominator());
  const im = new mapnik.Image(256, 256);
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

app.get("/:z/:x/:y.grid.json", async (req, res) => {
  const {x,y,z} = req.params;
  const mercator = require('./sphericalmercator')
  mapnik.register_default_fonts();
  mapnik.register_default_input_plugins();
  const map = await new Promise((res, rej) => {
    const mapInstance = new mapnik.Map(256, 256);
    const define = path.join(__dirname, '../test/postgis.prod.xml');
    //    const define = path.join(__dirname, 'stylesheet.xml');
    console.log("path:", define);
    mapInstance.load(define, {strict: true},function(err,_map) {
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
  console.log("map.sacle:", map.scale());
  console.log("map.scaleDenominator:", map.scaleDenominator());
  const im = new mapnik.Image(256, 256);
  //  const buffer = await new Promise((res, rej) => {
  //    map.render(im, function(err, im) {
  //      if(err) throw err;
  //      im.encode('png', function(err,buffer) {
  //        if (err) throw err;
  //        res(buffer);
  ////        fs.writeFile('/tmp/test/tile.png',buffer, function(err) {
  ////          if (err) throw err;
  ////          console.log('saved map image to map.png');
  ////          res();
  ////        });
  //      });
  //    });
  //  });

  var grid = new mapnik.Grid(256, 256);
  const json = await new Promise((res, _rej) => {
    map.render(grid, {layer:"l1", fields:['id', 'lat', 'lon']}, function(err, grid) {
      if (err) throw err;
      console.log(grid);
      const json = grid.encodeSync({resolution: 4, features: true});
      res(json);
    });
  });
  res.set({'Content-Type': 'application/json'});
  res.json(json);
});

//freetown
app.get("/freetown/:z/:x/:y.png", async (req, res) => {
  const {x,y,z} = req.params;
  const mercator = require('./sphericalmercator')
  mapnik.register_default_fonts();
  mapnik.register_default_input_plugins();
  const map = await new Promise((res, rej) => {
    const mapInstance = new mapnik.Map(256, 256);
    const define = path.join(__dirname, '../test/postgis.freetown.prod.xml');
//    const define = path.join(__dirname, 'stylesheet.xml');
    console.log("path:", define);
    mapInstance.load(define, {strict: true},function(err,_map) {
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
        console.log("map.sacle:", map.scale());
        console.log("map.scaleDenominator:", map.scaleDenominator());
  const im = new mapnik.Image(256, 256);
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

app.get("/freetown/:z/:x/:y.grid.json", async (req, res) => {
  const {x,y,z} = req.params;
  const mercator = require('./sphericalmercator')
  mapnik.register_default_fonts();
  mapnik.register_default_input_plugins();
  const map = await new Promise((res, rej) => {
    const mapInstance = new mapnik.Map(256, 256);
    const define = path.join(__dirname, '../test/postgis.freetown.prod.xml');
    //    const define = path.join(__dirname, 'stylesheet.xml');
    console.log("path:", define);
    mapInstance.load(define, {strict: true},function(err,_map) {
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
  console.log("map.sacle:", map.scale());
  console.log("map.scaleDenominator:", map.scaleDenominator());
  const im = new mapnik.Image(256, 256);
  //  const buffer = await new Promise((res, rej) => {
  //    map.render(im, function(err, im) {
  //      if(err) throw err;
  //      im.encode('png', function(err,buffer) {
  //        if (err) throw err;
  //        res(buffer);
  ////        fs.writeFile('/tmp/test/tile.png',buffer, function(err) {
  ////          if (err) throw err;
  ////          console.log('saved map image to map.png');
  ////          res();
  ////        });
  //      });
  //    });
  //  });

  var grid = new mapnik.Grid(256, 256);
  const json = await new Promise((res, _rej) => {
    map.render(grid, {layer:"l1", fields:['id', 'lat', 'lon']}, function(err, grid) {
      if (err) throw err;
      console.log(grid);
      const json = grid.encodeSync({resolution: 4, features: true});
      res(json);
    });
  });
  res.set({'Content-Type': 'application/json'});
  res.json(json);
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
