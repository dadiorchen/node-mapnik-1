const path = require("path");
const fs = require("fs");
const {config, configFreetown, getXMLString} = require("./config");
const { Pool} = require('pg');
const log = require("loglevel");


describe("Json", () => {

  it("single", async () => {
    const { Pool} = require('pg');
    const pool = new Pool({ connectionString: process.env.DB_URL });
    const sql = `
        /* sql case1 */
  SELECT
    'cluster' AS type,
    'case1 with zoom target tile' AS log,
    cluster_1.id,
    cluster_1.estimated_geometric_location,
    cluster_1.latlon,
    cluster_1.region_type,
    cluster_1.count,
    cluster_1.count_text,
    zoom_target.centroid zoom_to
  FROM (
      /* sql case1 tile */
      SELECT
      'cluster' AS type,
      'case1 tile' AS log,
      NULL AS zoom_to,
      region_id id,
      centroid estimated_geometric_location,
      St_asgeojson(centroid) latlon,
      type_id as region_type,
      count(tree_region.id) count,
      CASE WHEN count(tree_region.id) > 1000
      THEN  (count(tree_region.id) / 1000) || 'K'
      ELSE count(tree_region.id) || ''
      END AS count_text
      FROM active_tree_region tree_region
      WHERE zoom_level = 2
      GROUP BY region_id, centroid, type_id
  ) cluster_1
  LEFT JOIN
  (SELECT
    DISTINCT ON
    (region.id) region.id region_id,
    contained.region_id most_populated_subregion_id,
    contained.total,
    contained.zoom_level,
    ST_ASGeoJson(contained.centroid) centroid
  FROM
    (
    SELECT
      region_id,
      zoom_level
    FROM active_tree_region tree_region
    WHERE
      zoom_level = 2
    GROUP BY
      region_id,
      zoom_level ) populated_region
  JOIN region ON
    region.id = populated_region.region_id
  JOIN (
    SELECT
      region_id,
      zoom_level,
      count(tree_region.id) AS total,
      centroid
    FROM active_tree_region tree_region
    WHERE
      zoom_level = 4
    GROUP BY
      region_id,
      zoom_level,
      centroid ) contained ON
    ST_CONTAINS(region.geom,
    contained.centroid)
  WHERE
    TRUE
  ORDER BY
    region.id,
    total DESC
  ) zoom_target
  ON cluster_1.id = zoom_target.region_id
    `;
      const result = await pool.query({
        text: sql,
        values:[]
      });
    log.warn("result:", result);
    const points = result.rows.map(row => {
      const coord = JSON.parse(row.latlon).coordinates;
      const count = parseInt(row.count);
      const {count_text} = row;
      return `{"type":"Feature","geometry":{"type":"Point","coordinates": [${coord.join(",")}]},"properties":{"count":${count}, "count_text": "${count_text}"}}`
    });
    //{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-10,10]},"properties":{"count":1, "count_text":"1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-10,20]},"properties":{"count":1, "count_text":"1"}}]}
    const json = `{"type":"FeatureCollection","features":[${points.join(",")}]}`;
    log.warn("json:", json);

  }, 10000);

  it("Render one", async () => {
    const mapnik = require("../lib/mapnik");
    const path = require("path");
    const log = require("loglevel");
    const mercator = require('./sphericalmercator')
    const z = 2;
    const x = 1;
    const y = 1;
    //font
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();
    log.warn("fonts:", mapnik.fonts());
    const mapInstance = new mapnik.Map(256, 256);
    mapInstance.registerFonts(path.join(__dirname, '../test/data/map-a/'), {recurse:true});
    log.warn("font instance:", mapInstance.fonts());
    mapnik.Logger.setSeverity(mapnik.Logger.DEBUG);
    log.warn("log level of mapnik:", mapnik.Logger.getSeverity());
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
//        ...params,
      });

      const {xmlJson} = require("./xml");
      let xmlStringJson = xmlJson.replace("json_data", `{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-10,10]},"properties":{"count":1, "count_text":"1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-10,20]},"properties":{"count":1, "count_text":"1"}}]}`);
      log.warn("xmlJson length:", xmlJson.length);
      log.warn("xmlString:", xmlStringJson);
      mapInstance.fromString(xmlStringJson, {
        strict: true,
        base: __dirname,
      },function(err,_map) {
        if(err){
          console.error("e:", err); throw "failed"; 
        }
//        if (options.bufferSize) { obj.bufferSize = options.bufferSize;
//        }
        res(_map); 
      }); 
    }); 
    console.log("map:", map); 
    console.log("x,y,z:",
          x,y,z);
    // bbox for x,y,z
    const bbox = mercator.xyz_to_envelope(
      //x, y, z, false); 
      parseInt(x),
      parseInt(y), parseInt(z), false);
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

    let begin = Date.now();
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
    fs.writeFileSync('map.png',buffer);
  });

  it("original render way", async () => {
    const mapnik = require("../lib/mapnik");
    const mercator = require('./sphericalmercator')
    console.log("ok!");
    const scaleH = 2;
    const scaleV = 2;

    // register fonts and datasource plugins
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();

    const begin = Date.now();

    var map = new mapnik.Map(256*scaleH, 256*scaleV);
    await new Promise((res, rej) => {
      map.load('./greenstand/stylesheet2.xml', function(err,map) {
        if (err) throw err;
        map.zoomAll();
        console.log("map:", map);
        console.log("map.zoomAll:", map.zoomAll);
        console.log("map.zoomToBox:", map.zoomToBox);
        console.log("map.load:", map.load);
        console.log("map.sacle:", map.scale());
        console.log("map.scaleDenominator:", map.scaleDenominator());
        //        const ratio = map.scale();
        ////        map.extent = [-180*ratio, -85*ratio, 180*ratio, 85*ratio];
        //        map.zoomToBox([-50*ratio,-50*ratio,50*ratio,50*ratio]);
        var bbox = mercator.xyz_to_envelope(
          parseInt(1),
          parseInt(1),
          parseInt(2), false
        );
        map.extent = bbox;
        var im = new mapnik.Image(256*scaleH, 256*scaleV);
        map.render(im, function(err,im) {
          if (err) throw err;
          im.encode('png', function(err,buffer) {
            if (err) throw err;
            fs.writeFile('map.png',buffer, function(err) {
              if (err) throw err;
              console.log('saved map image to map.png');
              res();
            });
          });
        });
      });
    });
    console.log("took:", Date.now() - begin);
  });

  it.only("Render one with real config function", async () => {
    const mapnik = require("../lib/mapnik");
    const path = require("path");
    const log = require("loglevel");
    const mercator = require('./sphericalmercator')
    const z = 2;
    const x = 1;
    const y = 1;
    //font
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();
    log.warn("fonts:", mapnik.fonts());
    const mapInstance = new mapnik.Map(256, 256);
    mapInstance.registerFonts(path.join(__dirname, '../test/data/map-a/'), {recurse:true});
    log.warn("font instance:", mapInstance.fonts());
    mapnik.Logger.setSeverity(mapnik.Logger.DEBUG);
    log.warn("log level of mapnik:", mapnik.Logger.getSeverity());
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
//        ...params,
      });

//      const {xmlJson} = require("./xml");
//      let xmlStringJson = xmlJson.replace("json_data", `{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-10,10]},"properties":{"count":1, "count_text":"1"}},{"type":"Feature","geometry":{"type":"Point","coordinates":[-10,20]},"properties":{"count":1, "count_text":"1"}}]}`);
//      log.warn("xmlJson length:", xmlJson.length);
//      log.warn("xmlString:", xmlStringJson);
      mapInstance.fromString(xmlString, {
        strict: true,
        base: __dirname,
      },function(err,_map) {
        if(err){
          console.error("e:", err); throw "failed"; 
        }
//        if (options.bufferSize) { obj.bufferSize = options.bufferSize;
//        }
        res(_map); 
      }); 
    }); 
    console.log("map:", map); 
    console.log("x,y,z:",
          x,y,z);
    // bbox for x,y,z
    const bbox = mercator.xyz_to_envelope(
      //x, y, z, false); 
      parseInt(x),
      parseInt(y), parseInt(z), false);
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

    let begin = Date.now();
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
    fs.writeFileSync('map.png',buffer);
  }, 10000);
});

