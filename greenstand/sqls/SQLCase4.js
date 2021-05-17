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
          /* case4 tile */
          SELECT 
          id,
          'cluster' as type,
          'case4 tile' AS log,
          location estimated_geometric_location,
          St_asgeojson(location) centroid, 
          St_asgeojson(location) latlon,
          count,
          CASE WHEN count > 1000 
          THEN  (count / 1000) || 'K'
          ELSE count || ''
          END AS count_text,
          NULL as zoom_to
          FROM clusters
          WHERE zoom_level = 14 
          ${this.getBoundingBoxQuery()}
        `;
    return text;
  }
}

module.exports = SQLCase4;
