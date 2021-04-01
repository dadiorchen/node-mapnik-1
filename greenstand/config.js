const path = require("path");
const fs = require("fs");
const {xml} = require("./xml");
const Map = require("./Map");
const log = require("loglevel");

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
  const define = path.join(__dirname, '../test/postgis.xml');
  const content = fs.readFileSync(define).toString();
  const newDefine = path.join(__dirname, '../test/postgis.prod.xml');

  const contentConfig = replace(content);
  fs.writeFileSync(newDefine,contentConfig);
}

function configFreetown(){
  const define = path.join(__dirname, '../test/postgis.xml');
  const content = fs.readFileSync(define).toString();
  const newDefine = path.join(__dirname, '../test/postgis.freetown.prod.xml');

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

async function getXMLString(zoomLevel){
  let xmlString = replace(xml);
  const map = new Map();
  await map.init({
    zoom_level: zoomLevel,
  });
  const sql = await map.getQuery();
  log.warn("sql:", sql);

  xmlString = xmlString.replace(
    "select * from trees",
    sql,
  );
  return xmlString;
}

module.exports = {
  config, 
  configFreetown, 
  replace,
  getXMLString,
};
