const router = require("express").Router();
const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const passport = require("passport");




// GET REGISTER USER
router.get("/signup", (req, res, next) => {
    var massagesError = req.flash("error")
    res.render("users/register", { title: "تسجيل الدخول", massages: massagesError,user:req.session.user })
})


//REGISTER USER
router.post("/signup", [
        check("name").notEmpty().withMessage("ادخل الأسم"),
        check("password").notEmpty().withMessage("ادخل كلمه المرور"),
        check("password").isLength({ min: 5 }).withMessage("كلمه المرور يجب ان تكو اكبر من 5 اعداد")

    ], async(req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log("===".repeat(50))
            console.log(errors.errors);
            var validationMasseges = [];
            for (let i = 0; i < errors.errors.length; i++) {
                validationMasseges.push(errors.errors[i].msg)
            }
            console.log(validationMasseges);
            req.flash("error", validationMasseges);
            res.redirect("/signup")
            return;
        }
        next()
    }, passport.authenticate("local-signup", {
        session: false,
        successRedirect: "signin",
        failureRedirect: "signup",
        failureFlash: true
    }))
    /*
                try{
                    const {name , password} = req.body;
                    const user  = await User.findOne({name})
                            if(user){
                                console.log(user)
                                req.flash("error" , "المستخدم موجود بالفعل")
                                res.redirect("/signup")
                            }else{
                                const newuser = await new User({
                                    name,
                                    password : new User().hashPassword(password)
                                });
                                
                                await newuser.save(newuser);
                                console.log("user" + newuser)
                                res.redirect("/")
                            }
                            
                     
                         
                       

                           
                    }catch(err){
                    console.log(err)
                }
      */

const isSgnin = (req,res,next)=>{
    if(req.session.isAuth){
        res.redirect("/")
    }else{
        next()
    }
}
// GET LOGIN USER
router.get("/signin", isSgnin, (req, res) => {
    const LoginError = req.flash("SignInError")
    res.render("users/login", { title: "تسجيل الدخول", massages: LoginError , user:req.session.user})
})

// // LOGIN USER
// router.post("/signin", passport.authenticate("local-signin", {
//     successRedirect: "/",
//     failureRedirect: "/signin",
//     failureFlash: true
// }))
router.post("/signin" , async (req,res,next)=>{
    const {name , password} = req.body;
    const user = await User.findOne({name})
    if(!user) {
        req.flash("SignInError" , "user not exist");
        res.redirect("/signin");
        return;
    }
    if(!user.Comparepassword(password)){
        req.flash("SignInError" , "invalid name or password");
        res.redirect("/signin");
        return;
    }
    req.session.isAuth = true
    req.session.user = user
    res.redirect("/")

})
router.get("/logout", (req, res, next) => {
    req.logOut();
    res.redirect("signin")
})



module.exports = router;