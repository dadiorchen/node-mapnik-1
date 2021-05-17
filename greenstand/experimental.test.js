const mapnik = require("../lib/mapnik");


describe("try", () => {

  it("cluster", async () => {
    let xmlString = `
    <?xml version="1.0" encoding="utf-8"?>
    <!DOCTYPE Map[]>
    <Map  srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs" maximum-extent="-20037508.3,-20037508.3,20037508.3,20037508.3" buffer-size="46">

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
          file="../greenstand/pin_29px.png"
          opacity="1.0"
          allow-overlap="true"
          ignore-placement="true"
          />
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
          <Parameter name="type">geojson</Parameter>
          <Parameter name="file">./greenstand/trees_sample.geojson</Parameter>
        </Datasource>
      </Layer>

    </Map>
    `
    mapnik.register_default_fonts();
    mapnik.register_default_input_plugins();
    const map = await new Promise((res, rej) => {
      const mapInstance = new mapnik.Map(256, 256);

      mapInstance.fromString(xmlString, {strict: true},function(err,_map) {
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
  });
});
