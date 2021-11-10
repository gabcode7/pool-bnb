const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const app = express();
//Requerimos paquetes para usar passport
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

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

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Modelo Piscina 
const Pool = mongoose.model("piscinas", poolsSchema);

//Modelo Reviews
const Review = mongoose.model("reviews", reviewsSchema);

//Metodos Home
app.get("/", function(req, res) {
    res.render("home.ejs");
});

//Metodos Signin
app.get("/guest/signin", function(req, res) {
    res.render("guest-signin.ejs");
});

app.post("/register", function(req, res) {
    User.register(
      {
        username: req.body.username,
        firstName: req.body.fName,
        lastName: req.body.lName,
        userType: req.body.userType,
        pools: []
      },
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/guest/signin");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/host/dashboard");
          });
        }
      }
    );
});

app.post("/login", function(req, res) { 
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local");
      res.redirect("/host/dashboard");
    }
  });

});

//Metodos Dashboard Host
app.get("/host/dashboard", function(req, res){
  if (req.isAuthenticated()) {
    const userEmail = req.session.passport.user; 
    
    Pool.find({hostEmail: userEmail }, function (err, pools){
      if (err) {
        console.log(err);
      } else {
        res.render("dashboard", {foundPools:  pools });
      }
    });

  } else {
    res.redirect("/guest/signin");
  }

});

app.post("/dashboard", function(req, res){
  //Recuperamos los datos
  const address = req.body.address;
  const description = req.body.description;
  const costPerNight = req.body.costPerNight;
  const poolSize = req.body.poolSize;

  //Creamos la piscina nueva
  const pool = new Pool({
    hostEmail: req.session.passport.user,
    address: address,
    description: description,
    costPerNight: costPerNight,
    poolSize: poolSize,
    reviews: [],
  });

  //Guardamos la piscina nueva
  pool.save();
  const usuario = req.session.passport.user;
  //Buscamos el usuario para agregar la piscina al usuario
  User.findOne({username: usuario}, function (err, usuarioEncontrado) {
    if (err) {
      console.log(err);
    } else {
      let userPools = usuarioEncontrado.pools;
      userPools.push(pool);
      usuarioEncontrado.save();

      res.redirect("/host/dashboard");
    }
  });

});

//Metodo Editar Pool 
app.get("/host/pool/:id", function (req, res) {
  let id = req.params.id;
  let user = req.session.passport.user;

  User.findOne({ username: user }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      Pool.findOne({ _id: id }, function (err, foundPool) {
        if (err) {
          console.log(err);
        } else {
          res.render("host-pool", { resUser: foundUser, resPool: foundPool });
        }
      });
    }
  });
});

app.post("/updatePool", function (req, res) {
  let description = req.body.description;
  let poolSize = req.body.poolSize;
  let costPerNight = req.body.costPerNight;
  let id = req.body.pool;

  Pool.findOneAndUpdate({_id: id}, {description: description, poolSize: poolSize, costPerNight: costPerNight}, function (err) {
    if (err) { 
      console.log(err); 
    } else { 
      res.redirect("/host/dashboard");
    }
  });


});

//Metodo Logout
app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

//Metodo Search
app.post("/search", function(req, res) {
  //Buscamos las piscinas
  const search = req.body.search; 
  Pool.find({"address" : {$regex: search}}, function (err, foundPools) {
    if (err) {
      console.log(err);
    } else {
      res.render("search", {searchPools: foundPools});
    }
  });
});

//Pagina Piscina
app.get("/pools/:id", function(req, res){
  let id = req.params.id;
  
  Pool.findOne({_id: id}, function(err, foundPool) {
    if (err) {
      console.log(err);
    } else {
      User.findOne({username: foundPool.hostEmail}, function(err, foundUser) {
        if (err) {
          console.log(err);
        } else {
           res.render("pool", { resPool: foundPool, resUser: foundUser});
        }
      });
    }
  });
});

//Pagina Review
app.get("/pools/review/:id", function(req, res) {
  let id = req.params.id;
  
  Pool.findOne({_id: id}, function(err, foundPool) {
    if (err) {
      console.log(err);
    } else {
      res.render("review", {reviewPool: foundPool});
    }
  });

});

//Formulario Review
app.post("/review", function(req, res) {
  const description = req.body.description; 
  const rating = req.body.rating;
  const username = req.session.passport.user;
  const idPiscina = req.body.idPiscina;

  const review = new Review({
    username: username,
    description: description,
    rating: rating
  });

  review.save();

  Pool.findOne({_id: idPiscina}, function(err, foundPool) {
    if (err) { 
      console.log(err);
    } else {
      foundPool.reviews.push(review);
      foundPool.save();
      res.redirect("/pools/" + idPiscina);
    }
  })

});

app.listen(3000, function(req, res) {
    console.log("Server started in port 3000!");
})