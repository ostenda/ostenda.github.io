const {Router} = require("express");
const controler = require("./controller")


const router = Router();

router.get('/', controler.getLocations)

module.exports = router;