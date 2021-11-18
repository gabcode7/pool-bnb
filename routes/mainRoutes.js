const express = require("express");

const router = express.Router();
const controller = require("../controller/mainController");

//Metodos Home
router.get("/", controller.home);

//Metodos Signin
router.get("/guest/signin", controller.singin);

router.post("/register", controller.register);

router.post("/login", controller.login);

//Metodos Dashboard Host
router.get("/host/dashboard", controller.dashboard_get);

router.post("/dashboard", controller.dashboard_post);

//Metodo Editar Pool 
router.get("/host/pool/:id", controller.editar_get);

router.post("/updatePool", controller.editar_post);

//Metodo Logout
router.get("/logout", controller.logout);

//Metodo Search
router.post("/search", controller.search);

//Pagina Piscina
router.get("/pools/:id", controller.pool_get);

//Pagina Review
router.get("/pools/review/:id", controller.review_get);

//Formulario Review
router.post("/review", controller.review_post);

module.exports = router;