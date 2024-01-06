const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/user")



passport.serializeUser((user, done) => {
    return done(null, user._id)
})

passport.deserializeUser(async(id, done) => {
    try {
        const user = await User.findOne({ id });
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
})





passport.use("local-signin", new LocalStrategy({
        usernameField: "name",
        passwordField: "password",
        passReqToCallback: true
    },
    async(req, name, password, done) => {
        try {
            const user = await User.findOne({ name: name });
            if (!user) return done(null, false, req.flash("SignInError", "الف سلامه ☺ , المستخدم غير موحجود"));
            if (!user.Comparepassword(password)) {
                return done(null, false, req.flash("SignInError", "الف سلامه ☺ , هناك خطأ في كلمه المرور"))
            }
            // if passwords match return user
            console.log(req.session, user);
            // req.session.user = user;
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }
));

passport.use("local-signup", new LocalStrategy({
    usernameField: "name",
    passwordField: "password",
    passReqToCallback: true,
}, async(req, name, password, done) => {
    try {

        const user = await User.findOne({ name: name })
        if (user) return done(null, false, req.flash("error", "المستخدم موجود بالفعل"))
        const newuser = new User({ name: name, password: new User().hashPassword(password) })
        await newuser.save(newuser);
        return done(null, newuser)

    } catch (error) {
        return done(error, false)
    }
}))

// const LocalStrategy = require("passport-local");
// const User = require("./userModel");
// module.exports = (passport) => {
//  passport.use(
//    "local-signup",
//    new LocalStrategy(
//      {
//        usernameField: "email",
//        passwordField: "password",
//      },
//      async (email, password, done) => {
//        try {
//          // check if user exists
//          const userExists = await User.findOne({ "email": email });
//          if (userExists) {
//            return done(null, false)
//          }
//          // Create a new user with the user data provided
//          const user = await User.create({ email, password });
//          return done(null, user);
//        } catch (error) {
//          done(error);
//        }
//      }
//    )
//  );
// }