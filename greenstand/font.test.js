const mapnik = require("../lib/mapnik");
const log = require("loglevel");
const path = require('path');
const fs = require("fs");

describe("font", () => {

  it("font", async () => {

    function xmlWithFont(font) {
      var val = '<Map font-directory="./"><Style name="text"><Rule>';
      val += '<TextSymbolizer size="12" face-name="' + font + '"><![CDATA[[name]]]></TextSymbolizer>';
      val += '</Rule></Style></Map>';
      return val;
    }

    const font = "DejaVu Serif Condensed Bold Italic";
    var map = new mapnik.Map(4, 4);
    map.registerFonts('./test/data/map-a/', {recurse:true});
    log.warn("font:", map.fonts());
    expect(map.fonts().indexOf(font)).toBe(0);
    const base = path.resolve(path.join(__dirname,'../test/data','map-a'));
    log.warn("base:", base);
    map.fromStringSync(xmlWithFont(font), {
      strict:true,
      base,
    });
    const r = await new Promise((res, rej) => {
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
    
//    assert.throws(function() { map.registerFonts(); });
//    assert.throws(function() { map.registerFonts(12); });
//    assert.throws(function() { map.registerFonts('./test/data/map-a/', null); });
//    assert.throws(function() { map.registerFonts('./test/data/map-a/', {recurse:1}); });
//    assert.equal(map.registerFonts('./test/data/DOESNOTEXIST/', {recurse:false}), false);
//    assert.equal(map.registerFonts('./test/data/map-a/', {recurse:false}), true);
//    assert.equal(map.fonts().indexOf('DejaVu Serif Condensed Bold Italic'),0);
  });

  it("font render", async () => {

    function xmlWithFont(font) {
      var val = `

<?xml version="1.0" encoding="utf-8"?>
<Map font-directory="../test/data/map-a/" srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over" background-color="steelblue" maximum-extent="-20037508.34, -20037508.34, 20037508.34, 20037508.34" >

    <Style name="style">
        <Rule>
            <PolygonSymbolizer fill="white" clip="false"/>
        </Rule>
    </Style>
    <Style name="geoms">
        <Rule>
            <Filter>[mapnik::geometry_type]=polygon or [fill]</Filter>
            <PolygonSymbolizer fill="[fill]" fill-opacity="[fill-opacity]" />
        </Rule>
        <Rule>
            <Filter>[mapnik::geometry_type]=linestring or [stroke]</Filter>
            <LineSymbolizer stroke="[stroke]" stroke-width="[stroke-width]" stroke-opacity="[stroke-opacity]" />
        </Rule>
    </Style>
    <Style name="points" filter-mode="first">
        <Rule>
            <!--
            <Filter>[mapnik::geometry_type]=point and [marker-path]</Filter>
            -->
            <!--
            <PointSymbolizer
              file="./pin_29px.png"
              opacity="1"
              allow-overlap="true"
              ignore-placement="true"
            />
            -->
            <TextSymbolizer
                  face-name="${font}" size="12"
            >
              [sss]
          </TextSymbolizer>
        </Rule>
    </Style>

  <!--
    <Layer name="world" srs="+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0.0 +k=1.0 +units=m +nadgrids=@null +wktext +no_defs +over">
        <StyleName>style</StyleName>
        <Datasource>
            <Parameter name="file">world_merc.shp</Parameter>
            <Parameter name="encoding">iso-8859-1</Parameter>
            <Parameter name="type">shape</Parameter>
        </Datasource>
    </Layer>
  -->
    <Layer name="layer" srs="+proj=longlat +datum=WGS84 +no_defs  <>">
        <StyleName>geoms</StyleName>
        <StyleName>points</StyleName>
        <Datasource>
            <Parameter name="type">geojson</Parameter>
            <Parameter name="file">./trees_text.geojson</Parameter>
            <!--
            <Parameter name="inline"><![CDATA[{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[0,80]}},{"type":"Feature","geometry":{"type":"Point","coordinates":[100,0]}}]}]]></Parameter>
            -->
            <!--
            <Parameter name="inline"><![CDATA[{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"MultiPoint","coordinates":[[0,0], [100,20], [1,0],[-90, -10]]},"properties":{"marker-color":"7e7e7e","marker-size":"medium","symbol":"-","name":"Dinagat Islands","marker-path":"/pin_29px.png"}}]}]]></Parameter>
            -->
        </Datasource>
    </Layer>

</Map>`;
      return val;
    }

    const font = "DejaVu Serif Condensed Bold Italic";
    var map = new mapnik.Map(256, 256);
    mapnik.register_default_input_plugins();
    map.registerFonts('./test/data/map-a/', {recurse:true});
    log.warn("font:", map.fonts());
    expect(map.fonts().indexOf(font)).toBe(0);
    const base = path.resolve(path.join(__dirname));//,'../test/data','map-a'));
    log.warn("base:", base);
    map.fromStringSync(xmlWithFont(font), {
      strict:true,
      base,
    });
    map.zoomToBox([-180.0, -90.0, 180.0, 90.0]);
    const r = await new Promise((res, rej) => {
        var im = new mapnik.Image(256, 256);
        map.render(im, function(err,im) {
          if (err) throw err;
          im.encode('png', function(err,buffer) {
            if (err) throw err;
            fs.writeFile('/tmp/test/map2.png',buffer, function(err) {
              if (err) throw err;
              console.log('saved map image to map.png');
              res();
            });
          });
        });
    });
    
//    assert.throws(function() { map.registerFonts(); });
//    assert.throws(function() { map.registerFonts(12); });
//    assert.throws(function() { map.registerFonts('./test/data/map-a/', null); });
//    assert.throws(function() { map.registerFonts('./test/data/map-a/', {recurse:1}); });
//    assert.equal(map.registerFonts('./test/data/DOESNOTEXIST/', {recurse:false}), false);
//    assert.equal(map.registerFonts('./test/data/map-a/', {recurse:false}), true);
//    assert.equal(map.fonts().indexOf('DejaVu Serif Condensed Bold Italic'),0);
  });
});
