const xml2js = require("xml2js")

const xml =`
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE Map[]>
<Map font-directory="../test/data/map-a/" srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs" maximum-extent="-20037508.3,-20037508.3,20037508.3,20037508.3" buffer-size="46">

<Parameters>
  <Parameter name="maximum-extent"><![CDATA[-20037508.3,-20037508.3,20037508.3,20037508.3]]></Parameter>
  <Parameter name="format">png</Parameter>
  <Parameter name="markers_symbolizer_caches_disabled"><![CDATA[false]]></Parameter>
  <Parameter name="interactivity_layer">layer0</Parameter>
  <Parameter name="interactivity_fields">id</Parameter>
</Parameters>

<!--
<Style name="style" opacity=".5" >
    <Rule>
        <PolygonSymbolizer fill="black" clip="false"/>
    </Rule>
</Style>

<Layer name="world" >
    <StyleName>style</StyleName>
    <Datasource>
        <Parameter name="file">data/world_merc.shp</Parameter>
        <Parameter name="encoding">iso-8859-1</Parameter>
        <Parameter name="type">shape</Parameter>
    </Datasource>
</Layer>
-->

<Style name="layer0" filter-mode="first" >
  <Rule>
    <PointSymbolizer
      file="../greenstand/images/cluster_46px.png"
      opacity="1.0"
      allow-overlap="true"
      ignore-placement="true"
      />
    <TextSymbolizer
      face-name="DejaVu Serif Condensed Bold Italic" 
      fill="black" 
      size="14"
    >
      [count]
  </TextSymbolizer>
    <!--
    <MarkersSymbolizer fill="#ff6600" opacity="1" width="16" stroke="#ffffff" stroke-width="3" stroke-opacity="0.9" placement="point" marker-type="ellipse" allow-overlap="true" clip="true" />
    -->
  </Rule>
</Style>
<Layer name="l1"
  cache-features="true"
  srs="+proj=longlat +datum=WGS84 +no_defs"
  >
    <StyleName>layer0</StyleName>
    <Datasource>
       <Parameter name="srid"><![CDATA[4326]]></Parameter>
       <Parameter name="user"><![CDATA[postgres]]></Parameter>
       <Parameter name="host"><![CDATA[172.17.0.2]]></Parameter>
       <Parameter name="port"><![CDATA[5432]]></Parameter>
       <Parameter name="password"><![CDATA[greenstand]]></Parameter>
       <Parameter name="type"><![CDATA[postgis]]></Parameter>
       <Parameter name="extent"><![CDATA[-20037508.3,-20037508.3,20037508.3,20037508.3]]></Parameter>
       <Parameter name="max_size"><![CDATA[10]]></Parameter>
       <Parameter name="table"><![CDATA[(SELECT * FROM trees) as cdbq]]></Parameter>
       <Parameter name="dbname"><![CDATA[treetracker_dev]]></Parameter>
       <Parameter name="geometry_field"><![CDATA[estimated_geometric_location]]></Parameter>
    </Datasource>
  </Layer>


</Map>
`;

class XMLConfig{
  constructor(){
    this.xml = xml;
  }

  async select(sentence){
    const obj = await xml2js.parseStringPromise(this.xml);
    console.dir(obj);
    this.obj = obj;
    this.xml = this.xml.replace("(SELECT * FROM trees) as cdbq", sentence);
  }

  async toString(){
    //return this.xml;
    const builder = new xml2js.Builder();
    const xml = builder.buildObject(this.obj);
    return xml;
  }
}

module.exports = XMLConfig;
