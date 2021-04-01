/*
 * Case4, search DB via clusters table
 */

class SQLCase4{

  constructor(){
  }

  setBounds(bounds){
    this.bounds = bounds;
  }

  getBoundingBoxQuery(){
    let result = "";
    if (this.bounds) {
      result += 'AND location && ST_MakeEnvelope(' + this.bounds + ', 4326) ';
    }
    return result;
  }

  getQuery(){
      const text = `
          /* case4 */
          SELECT 
          id,
          'cluster' as type,
          location estimated_geometric_location,
          St_asgeojson(location) centroid, 
          St_asgeojson(location) latlon,
          count
          FROM clusters
          WHERE zoom_level = 14 
          ${this.getBoundingBoxQuery()}
        `;
    return text;
  }
}

module.exports = SQLCase4;
