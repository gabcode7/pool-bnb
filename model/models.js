const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// Creamos los esquemas

//Esquema Reviews
const reviewsSchema = new mongoose.Schema({
    username: String,
    description: String,
    rating: Number
});

//Esquema Piscinas 
const poolsSchema = new mongoose.Schema({
    hostEmail: String,
    address: String, 
    description: String,
    costPerNight: Number, 
    poolSize: String,
    reviews: [reviewsSchema]
});

// Esquema Usuarios
const usersSchema = new mongoose.Schema({    
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  userType: String,
  pools: [poolsSchema],
});

usersSchema.plugin(passportLocalMongoose);

//Creamos Los Modelos

//Modelo Usuario
const User = mongoose.model("usuarios", usersSchema);


//Modelo Piscina 
const Pool = mongoose.model("piscinas", poolsSchema);

//Modelo Reviews
const Review = mongoose.model("reviews", reviewsSchema);

module.exports = {User, Pool, Review};