const express = require("express");
const locationRoutes = require("../model/routes")
const client = require("../db")
const app = express();
const port = 3000;

//middleware
app.use(express.json());


app.get('/', (req, res) => {
    res.send ("Hello World");
});


// Define the /map endpoint
app.get('/map', async (req, res) => {
  try {
    if (!req.query.bbox) {
      res.status(400).send('Bounding box parameter is missing');
      return;
    }
    const [west, south, east, north] = req.query.bbox.split(',');
    
    // Construct the PostGIS bounding box query
    const bbox = `ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)`;
    
    // Construct the SQL query to retrieve the OSM data within the bounding box
    const query = `
      SELECT osm_id, name, ST_AsGeoJSON(ST_Transform(way, 4326)) AS geometry
      FROM planet_osm_point
      WHERE amenity IN ('restaurant', 'cafe', 'bar', 'park')
      AND way && ST_Transform(${bbox}, 3857);
    `;
    
    // Execute the SQL query
    const result = await client.query(query);
    
    // Send the OSM data as GeoJSON
    res.send({
      type: 'FeatureCollection',
      features: result.rows.map((row) => ({
        type: 'Feature',
        properties: {
          osm_id: row.osm_id,
          name: row.name,
        },
        geometry: JSON.parse(row.geometry),
      })),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({error: e});
  }
});
  





window.onload = () => {
    let downloaded = false;

    const el = document.querySelector("[gps-new-camera]");

    el.addEventListener("gps-camera-update-position", async(e) => {
        if(!downloaded) {
            const west = e.detail.position.longitude - 0.05,
                  east = e.detail.position.longitude + 0.05,
                  south = e.detail.position.latitude - 0.05;
                  north = e.detail.position.latitude + 0.05;
            const response = await fetch(`/map?bbox=${west},${south},${east},${north}`);
            const pois = await response.json();
            pois.features.forEach ( feature => {
                const compoundEntity = document.createElement("a-entity");
                compoundEntity.setAttribute('gps-new-entity-place', {
                    latitude: feature.geometry.coordinates[1],
                    longitude: feature.geometry.coordinates[0]
                });
                const box = document.createElement("a-box");
                box.setAttribute("scale", {
                    x: 20,
                    y: 20,
                    z: 20
                });
                box.setAttribute('material', { color: 'red' } );
                box.setAttribute("position", { 
                    x : 0,
                    y : 20,
                    z: 0 
                } );
                const text = document.createElement("a-text");
                const textScale = 100;
                text.setAttribute("look-at", "[gps-new-camera]");
                text.setAttribute("scale", {
                    x: textScale,
                    y: textScale,
                    z: textScale 
                });
                text.setAttribute("value", feature.properties.name);
                text.setAttribute("align", "center");
                compoundEntity.appendChild(box);
                compoundEntity.appendChild(text);
                document.querySelector("a-scene").appendChild(compoundEntity);
            });
        }
        downloaded = true;
    });
};

app.listen(port, () => console.log('app listening on port 3000'));