const path = require("path");
const fs = require("fs");


function config(){
  const define = path.join(__dirname, '../test/postgis.xml');
  const content = fs.readFileSync(define).toString();
//  expect(content).toMatch(/172.17/);
  const newDefine = path.join(__dirname, '../test/postgis.prod.xml');

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

  fs.writeFileSync(newDefine,contentConfig);
}

module.exports = config;