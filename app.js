const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const { Cookie } = require("express-session");


//connect TO DB
mongoose
    .connect("mongodb://127.0.0.1:27017/Fax")
    .then(() => {
        console.log("connected to db....");
    })
    .catch((err) => {
        console.log("Error...");
    });

require("./config/passport");


// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(session({
    secret: "MotabaaArchive",
    resave: false,
    saveUninitialized: false,
    // cookie: { secure: true, maxAge: 600000 }
    
}));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, "/public")));



app.use("/" , require("./routes/index"))
app.use("/", require("./routes/user"))



app.listen(4040, () => {
    console.log("server  connected......")
});