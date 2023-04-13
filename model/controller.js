const client = require("../db")

const getLocations = (req, res ) => {
    try{
        client.connect(async (error, client, release) => {
            let resp = await client.query("SELECT osm_id, ST_AsText(way) FROM planet_osm_line limit 1")
            res.send(resp.rows);
        })
    }catch(error){
        console.log(error)
    }
}

module.exports = {getLocations}