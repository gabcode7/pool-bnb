const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
//Requerimos paquetes para usar passport
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const mainRoutes = require("./routes/mainRoutes");
const model = require("./model/models");

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
    extended: true,
  })
);

app.use(session({
    secret: "This is a secret.",
    resave: false, 
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Conectamos a la base de datos
mongoose.connect("mongodb://localhost:27017/waterbnbDB");

passport.use(model.User.createStrategy());

passport.serializeUser(model.User.serializeUser());
passport.deserializeUser(model.User.deserializeUser());



//Rutas
app.use(mainRoutes);


app.listen(3000, function(req, res) {
    console.log("Server started in port 3000!");
})