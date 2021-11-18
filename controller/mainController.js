const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const mongoose = require("mongoose");
const model = require("../model/models")

const home = function (req, res) {
  res.render("home.ejs");
};

const singin = function (req, res) {
  res.render("guest-signin.ejs");
};

const register = function (req, res) {
  model.User.register(
    {
      username: req.body.username,
      firstName: req.body.fName,
      lastName: req.body.lName,
      userType: req.body.userType,
      pools: [],
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
};

const login = function (req, res) {
  const user = new model.User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local");
      res.redirect("/host/dashboard");
    }
  });
};

const dashboard_get = function (req, res) {
  if (req.isAuthenticated()) {
    const userEmail = req.session.passport.user;

    model.Pool.find({ hostEmail: userEmail }, function (err, pools) {
      if (err) {
        console.log(err);
      } else {
        res.render("dashboard", { foundPools: pools });
      }
    });
  } else {
    res.redirect("/guest/signin");
  }
};

const dashboard_post = function (req, res) {
  //Recuperamos los datos
  const address = req.body.address;
  const description = req.body.description;
  const costPerNight = req.body.costPerNight;
  const poolSize = req.body.poolSize;

  //Creamos la piscina nueva
  const pool = new model.Pool({
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
  model.User.findOne({ username: usuario }, function (err, usuarioEncontrado) {
    if (err) {
      console.log(err);
    } else {
      let userPools = usuarioEncontrado.pools;
      userPools.push(pool);
      usuarioEncontrado.save();

      res.redirect("/host/dashboard");
    }
  });
};

const editar_get = function (req, res) {
  let id = req.params.id;
  let user = req.session.passport.user;

  model.User.findOne({ username: user }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      model.Pool.findOne({ _id: id }, function (err, foundPool) {
        if (err) {
          console.log(err);
        } else {
          res.render("host-pool", { resUser: foundUser, resPool: foundPool });
        }
      });
    }
  });
};

const editar_post = function (req, res) {
  let description = req.body.description;
  let poolSize = req.body.poolSize;
  let costPerNight = req.body.costPerNight;
  let id = req.body.pool;

  model.Pool.findOneAndUpdate(
    { _id: id },
    {
      description: description,
      poolSize: poolSize,
      costPerNight: costPerNight,
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/host/dashboard");
      }
    }
  );
};

const logout = function (req, res) {
  req.logout();
  res.redirect("/");
};

const search = function (req, res) {
  //Buscamos las piscinas
  const search = req.body.search;
  model.Pool.find({ address: { $regex: search } }, function (err, foundPools) {
    if (err) {
      console.log(err);
    } else {
      res.render("search", { searchPools: foundPools });
    }
  });
};

const pool_get = function (req, res) {
  let id = req.params.id;

  model.Pool.findOne({ _id: id }, function (err, foundPool) {
    if (err) {
      console.log(err);
    } else {
      model.User.findOne(
        { username: foundPool.hostEmail },
        function (err, foundUser) {
          if (err) {
            console.log(err);
          } else {
            res.render("pool", { resPool: foundPool, resUser: foundUser });
          }
        }
      );
    }
  });
};

const review_get = function (req, res) {
  let id = req.params.id;

  model.Pool.findOne({ _id: id }, function (err, foundPool) {
    if (err) {
      console.log(err);
    } else {
      res.render("review", { reviewPool: foundPool });
    }
  });
};

const review_post = function (req, res) {
  const description = req.body.description;
  const rating = req.body.rating;
  const username = req.session.passport.user;
  const idPiscina = req.body.idPiscina;

  const review = new model.Review({
    username: username,
    description: description,
    rating: rating,
  });

  review.save();

  model.Pool.findOne({ _id: idPiscina }, function (err, foundPool) {
    if (err) {
      console.log(err);
    } else {
      foundPool.reviews.push(review);
      foundPool.save();
      res.redirect("/pools/" + idPiscina);
    }
  });
};

module.exports = {
  home,
  singin,
  register,
  login,
  dashboard_get,
  dashboard_post,
  editar_get,
  editar_post,
  logout,
  search,
  pool_get,
  review_get,
  review_post,
};
