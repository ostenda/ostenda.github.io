const {Pool} = require('pg');
const wkt = require('wkt');
const client = new Pool({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "qwerty",
    database: "postgis_sample"
})


module.exports = client;

