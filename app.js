const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//Metodos Home
app.get("/", function(req, res) {
    res.render("home.ejs");
});

//Metodos Signin
app.get("/guest/signin", function(req, res) {
    res.render("guest-signin.ejs");
});

//Metodos Dashboard Inicio Sesion
app.get("/host/dashboard", function(req, res){
    res.render("dashboard.ejs");
});

//Metodos Search Result
app.get("/search", function(req, res) {
    res.render("search.ejs");
});

//Metodos Pool
app.get("/pool", function(req, res) {
    res.render("pool.ejs");
});

//Metodos Review
app.get("/review", function(req, res) {
    res.render("review.ejs");
});

//Metodos Host Pool 
app.get("/host/pool", function(req, res){
    res.render("host-pool.ejs");
});




app.listen(3000, function(req, res) {
    console.log("Server started in port 3000!");
})