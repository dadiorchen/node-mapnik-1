const express = require("express");
const mapnik = require("../lib/mapnik");

const app = express();
app.use(async (_req, res) => {
  // register fonts and datasource plugins
  mapnik.register_default_fonts();
  mapnik.register_default_input_plugins();

  var map = new mapnik.Map(256*5, 256*5);
  const buffer = await new Promise((resolve, _rej) => {
    map.load('./test/postgis.xml', function(err,map) {
      if (err) throw err;
      //        expect(map).toHaveProperty("srs", "+init=epsg:3857");
      map.zoomAll();
      var im = new mapnik.Image(256*5, 256*5);
      map.render(im, function(err,im) {
        if (err) throw err;
        im.encode('png', function(err,buffer) {
          if (err) throw err;
          resolve(buffer);
          //              fs.writeFile('/tmp/test/tree.png',buffer, function(err) {
          //                if (err) throw err;
          //                console.log('saved map image to map.png');
          //                res();
          //              });
        });
      });
    });
  });
  res.set({'Content-Type': 'image/png'});
  res.end(buffer);
});

module.exports = app;
