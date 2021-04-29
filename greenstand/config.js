const path = require("path");
const fs = require("fs");
const {xml, xmlTree, xmlJson} = require("./xml");
const Map = require("./Map");
const log = require("loglevel");
const { Pool} = require('pg');


/*
 * setup the DB connection
 */
function replace(content){
  //       <Parameter name="user"><![CDATA[postgres]]></Parameter>
  //       <Parameter name="host"><![CDATA[172.17.0.2]]></Parameter>
  //       <Parameter name="port"><![CDATA[5432]]></Parameter>
  //       <Parameter name="password"><![CDATA[greenstand]]></Parameter>
  //       <Parameter name="type"><![CDATA[postgis]]></Parameter>
  //       <Parameter name="extent"><![CDATA[-20037508.3,-20037508.3,20037508.3,20037508.3]]></Parameter>
  //       <Parameter name="max_size"><![CDATA[10]]></Parameter>
  //       <Parameter name="table"><![CDATA[(SELECT * FROM trees) as cdbq]]></Parameter>
  //       <Parameter name="dbname"><![CDATA[treetracker_dev]]></Parameter>
  const db_url = process.env.DB_URL;
  const match = db_url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(\w+)/);
  const db_user = match[1];
  const db_port = match[4];
  const db_password = match[2];
  const db_database = match[5];
  const db_host = match[3];
  function config(str){
    str = str.replace(/postgres/, db_user);
    str = str.replace(/172.17.0.2/, db_host);
    str = str.replace(/5432/, db_port);
    str = str.replace(/\[greenstand\]/, `[${db_password}]`);
    str = str.replace(/treetracker_dev/, db_database);
    return str;
  }
  const contentConfig = config(content);
  return contentConfig;
}

function config(){
  const define = path.join(__dirname, './layers/postgis.xml');
  const content = fs.readFileSync(define).toString();
  const newDefine = path.join(__dirname, './layers/postgis.prod.xml');

  const contentConfig = replace(content);
  fs.writeFileSync(newDefine,contentConfig);
}

function configFreetown(){
  const define = path.join(__dirname, './layers/postgis.xml');
  const content = fs.readFileSync(define).toString();
  const newDefine = path.join(__dirname, './layers/postgis.freetown.prod.xml');

  let contentConfig = replace(content);
  contentConfig = contentConfig.replace("(SELECT * FROM trees) as cdbq", 
    `
    (
    /* sql case2 */
    SELECT /* DISTINCT ON(trees.id) */
    'point' AS type,
    trees.id, trees.lat, trees.lon, trees.estimated_geometric_location
    FROM trees
    WHERE active = true
    AND trees.id IN(
    select distinct * from (
    SELECT trees.id as id from trees
    INNER JOIN (
    SELECT id FROM planter
    JOIN (
    SELECT entity_id FROM getEntityRelationshipChildren(
    (SELECT id FROM entity WHERE map_name = 'freetown')
    )
    ) org ON planter.organization_id = org.entity_id
    ) planter_ids
    ON trees.planter_id = planter_ids.id
    union all
    SELECT trees.id as id from trees
    INNER JOIN (
    SELECT id FROM planter
    JOIN (
    SELECT entity_id FROM getEntityRelationshipChildren(
    (SELECT id FROM entity WHERE map_name = 'freetown')
    )
    ) org ON planter.organization_id = org.entity_id
    ) planter_ids
    ON trees.planter_id = planter_ids.id
    ) t1
    )
    ) as cdbq
    `);
  fs.writeFileSync(newDefine,contentConfig);
}

async function getXMLString(options){
  const {
    zoomLevel,
    userid,
    wallet,
    timeline,
    map_name,
    bounds,
  } = options;
  const zoomLevelInt = parseInt(zoomLevel);
  let xmlTemplate;
  if(zoomLevelInt > 15){
    xmlTemplate = xmlTree;
  }else{
    xmlTemplate = xml;
  }
  let xmlString = replace(xmlTemplate);
  const map = new Map();
  await map.init({
    zoom_level: zoomLevelInt,
    userid,
    wallet,
    timeline,
    map_name,
    bounds,
  });
  const sql = await map.getQuery();
  log.warn("sql:", sql);

  //handle geojson case
  if(zoomLevelInt === 2){
    log.warn("handle geojson...");
    const pool = new Pool({ connectionString: process.env.DB_URL });
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
    xmlString = xmlJson.replace("json_data", json);
    log.warn("xmlJson length:", xmlJson.length);
    log.warn("xmlString:", xmlString);
  }else{
    xmlString = xmlString.replace(
      "select * from trees",
      sql,
    );
  }
  return xmlString;
}

module.exports = {
  config, 
  configFreetown, 
  replace,
  getXMLString,
};
