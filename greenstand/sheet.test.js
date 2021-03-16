const mapnik = require('../');
const fs = require('fs');
const log = require("loglevel");
const express = require("express");
const supertest = require("supertest");
const app = require("../greenstand/app");

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

  it("trees table map", async () => {

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

  it("server", async () => {
    const res = await supertest(app).get("/");
    expect(res.statusCode).toBe(200);

  });

  it("tile", async () => {
    const mapnik = require('mapnik')
    const mercator = require('../greenstand/sphericalmercator')
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();
    const map = await new Promise((res, rej) => {
      const mapInstance = new mapnik.Map(256, 256);
      mapInstance.load("./test/stylesheet.xml", {strict: true},function(err,_map) {
  //      if (options.bufferSize) {
  //        obj.bufferSize = options.bufferSize;
  //      }
        res(_map);
      });
    });
    expect(map).toBeDefined();
    // bbox for x,y,z
    var bbox = mercator.xyz_to_envelope(1, 1, 3, false);
    map.extent = bbox;
    var im = new mapnik.Image(256, 256);
    const r = await new Promise((res, rej) => {
      map.render(im, function(err, im) {
        if(err) throw err;
        im.encode('png', function(err,buffer) {
          if (err) throw err;
          fs.writeFile('/tmp/test/tile.png',buffer, function(err) {
            if (err) throw err;
            console.log('saved map image to map.png');
            res();
          });
        });
      });
    });
  });

  it("tile server", async () => {
    const res = await supertest(app).get("/0/0/0.png");
    expect(res.statusCode).toBe(200);
  }, 1000*60);

  it.only("grid", async () => {
    const mapnik = require('mapnik')
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();
    const map = await new Promise((res, rej) => {
      const mapInstance = new mapnik.Map(256, 256);
      mapInstance.load("./test/postgis.xml", {strict: true},function(err,_map) {
  //      if (options.bufferSize) {
  //        obj.bufferSize = options.bufferSize;
  //      }
        res(_map);
      });
    });
    expect(map).toHaveProperty("layers");
    const layers = map.layers();
    console.log("layers:", layers);
    for(const layer of layers){
      console.log("lay:", layer.describe());
    }
    map.zoomAll();
    
    expect(map).toBeDefined();
    var grid = new mapnik.Grid(256, 256, {key: 'id'});
    const r = await new Promise((res, rej) => {
      map.render(grid, {layer:"l1", fields:['id']}, function(err, grid) {
          if (err) throw err;
          console.log(grid);
          fs.writeFileSync('/tmp/test/points5.json', JSON.stringify(grid.encodeSync({resolution: 1, features: true})));
        res();
      });
    });
    var im = new mapnik.Image(256, 256);
    const r2 = await new Promise((res, rej) => {
      map.render(im, function(err, im) {
        if(err) throw err;
        im.encode('png', function(err,buffer) {
          if (err) throw err;
          fs.writeFile('/tmp/test/points5.png',buffer, function(err) {
            if (err) throw err;
            console.log('saved map image to map.png');
            res();
          });
        });
      });
    });
  });

});
