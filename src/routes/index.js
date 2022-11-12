const { Router } = require("express");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const countriesRoute = require("./countries");
const activitiesRoute = require("./activities");

const router = Router();

// Configurar los routers
router.use("/countries", countriesRoute);
router.use("/activities", activitiesRoute);

module.exports = router;
