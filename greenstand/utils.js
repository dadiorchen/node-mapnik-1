function setSql(content, sql){
    //const result = setSql('<Parameter name="table"><![CDATA[(SELECT * FROM trees) as cdbq]]></Parameter>');
  return content.replace(/CDATA\[\(.*\) as cdbq\]/s, `CDATA[(${sql}) as cdbq]`);
}

module.exports = {
  setSql,
}
