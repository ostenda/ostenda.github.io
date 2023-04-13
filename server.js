const express = require("express");
const locationRoutes = require("./model/routes")
const client = require("./db")
const app = express();
const port = 3000;

//middleware
app.use(express.json());


app.get('/', (req, res) => {
    res.send ("Hello World");
});

app.use("/api/locations", locationRoutes)

app.get("/test", (req, res) => {
    try{
        client.connect(async (error, client, release) => {
            let resp = await client.query("SELECT ST_AsText(way) FROM planet_osm_line limit 1")
            res.send(resp.rows);
        })
    }catch(error){
        console.log(error)
    }
});



// Define the /map endpoint
app.get('/map', async (req, res) => {
  try{
    if (!req.query.bbox) {
      res.status(400).send('Bounding box parameter is missing');
      return;
    }
      const [west, south, east, north] = req.query.bbox.split(',');
    
      // Construct the PostGIS bounding box query
      const bbox = `ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)`;
    
      // Construct the SQL query to retrieve the OSM data within the bounding box
      const query = `SELECT ST_AsGeoJSON(ST_Transform(${bbox}, 3857)) AS geometry; `;
    
     // console.log(query);
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
    } catch(e) {
        console.log(e);
        res.status(500).json({error: e});
    }
    });
  



app.listen(port, () => console.log('app listening on port 3000'));