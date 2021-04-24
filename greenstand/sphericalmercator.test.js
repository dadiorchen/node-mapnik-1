const mercator = require('./sphericalmercator');

describe("Spherical", () => {

  it("xyz_to_envelope_db_buffer Africa zero tile", async () => {
    const result = mercator.xyz_to_envelope_db_buffer(2, 1, 2, false, 100)
    //bbox db: [ -35.15625, 33.137551192346145, 125.15625, 47.989921667414194 ]
    //   9962               ) as cdbq WHERE "estimated_geometric_location" && ST_MakeEnvelope(-35.15624999906868,-33.13755119215213,125.1562500009313,77.15716252285503,4326)
    expect(result[0]).toBeCloseTo(-35.15624999906868);
    expect(result[1]).toBeCloseTo(-33.13755119215213);
    expect(result[2]).toBeCloseTo(125.1562500009313);
    expect(result[3]).toBeCloseTo(77.15716252285503);
  });

  it("xyz_to_envelope_db_buffer left top tile", async () => {
    const result = mercator.xyz_to_envelope_db_buffer(1, 0, 2, false, 100)
    //bbox db: [ -35.15625, 33.137551192346145, 125.15625, 47.989921667414194 ]
    //ST_MakeEnvelope(-125.1562500009314,47.9899216691001005786,35.15624999906871,85.05112874829089,4326)
    expect(result[0]).toBeCloseTo(-125.1562500009314);
    expect(result[1]).toBeCloseTo(47.9899216691001005786);
    expect(result[2]).toBeCloseTo(35.15624999906871);
    expect(result[3]).toBeCloseTo(85.05112874829089);
  });

  it("xyz_to_envelope_db_buffer tile 2,1,3", async () => {
    const result = mercator.xyz_to_envelope_db_buffer(1, 3, 2, false, 100)
    //   9960               ) as cdbq WHERE "estimated_geometric_location" && ST_MakeEnvelope(-125.1562500009313,-85.05112874735957,35.15624999906868,-47.98992166812653,4326)
    expect(result[0]).toBeCloseTo(-125.1562500009313);
    expect(result[1]).toBeCloseTo(-85.05112874735957);
    expect(result[2]).toBeCloseTo(35.15624999906868);
    expect(result[3]).toBeCloseTo(-47.98992166812653);
  });

});
