const dotenv = require("dotenv").config();
const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const ejs = require("ejs");
const path = require("path");

//ejs initializations

app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "./src/views"));

//sessions

require("./src/config/database");
const MongoDBStore = require("connect-mongodb-session")(session);

const sessionStore = new MongoDBStore({
  uri: process.env.MONGODB_CONNECTION_STRING,
  collection: "sessionlar",
});

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
    store: sessionStore,
  })
);

//flash message
app.use(flash());

app.use((req, res, next) => {
  res.locals.validation_error = req.flash("validation_error");
  res.locals.success_message = req.flash("success_message");
  res.locals.email = req.flash("email");
  res.locals.ad = req.flash("ad");
  res.locals.soyad = req.flash("soyad");
  res.locals.sifre = req.flash("sifre");
  res.locals.resifre = req.flash("resifre");

  res.locals.login_error = req.flash("error");

  next();
});

app.use(passport.initialize());
app.use(passport.session());

//routerlar include edilir
const authRouter = require("./src/routers/auth_router");
const expressEjsLayouts = require("express-ejs-layouts");
app.use(expressEjsLayouts);
//formdan gelen değerlerin okunabilmesi için
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use(express.json({ limit: "10mb" })); // JSON veri limiti ayarı

let requestid;

app.use("/", authRouter);

const server = app.listen(process.env.PORT, async () => {
  console.log(`Server ${process.env.PORT} portundan ayaklandı`);
});
