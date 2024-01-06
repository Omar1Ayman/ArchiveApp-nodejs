const router = require("express").Router();
const Fax = require("../models/Fax");
const moment = require('moment');
const multer = require("multer")
const { check, validationResult } = require("express-flash")

const isAuth = (req,res,next)=>{
    if(req.session.isAuth){
        next()
    }else{
        res.redirect("/signin")
    }
}

router.get("/" ,  isAuth, async(req, res) => {
    console.log("=====================isauthenticated================")
    console.log(req.isAuthenticated());
    console.log("=====================isauthenticated================")
    const user = req.session.user;
    // GEt DATE
    let newDate = new Date();
    let date = newDate.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

    const today = moment().startOf('day')
    console.log(newDate, "=>/<=", today.toDate(), moment(today).endOf('day').toDate());
    // GET TODAY FAXES
    const getfaxs = await Fax.find({
        createdAt: {
            $gte: today.toDate(),
            $lte: moment(today).endOf('day').toDate()
        }
    }).sort({ createdAt: 'desc' });
    // console.log(getfaxs);
    
    res.render("index", { getfaxs, date, moment, title: "الصفحه الرئيسيه" ,user});

});

router.get("/getallfaxes",isAuth ,async(req, res) => {


    // GET TODAY FAXES
    const getfaxs = await Fax.find({}).sort({ createdAt: 'desc' });
    // console.log(getfaxs);
    res.render("allfaxes", { getfaxs, moment, title: "جميع المكاتبات" ,user:req.session.user});

});

router.get("/getallfaxes/:from/:to", async(req, res) => {

    const { from, to } = req.params;
    console.log(moment(from).startOf("day").toDate())
    console.log(moment(to).endOf("day").toDate())
    const getfaxs = await Fax.find({
        createdAt: {
            $gte: moment(from).startOf("day").toDate(),
            $lte: moment(to).endOf("day").toDate()
        }
    }).sort({ createdAt: 'desc' });
    console.log("###".repeat(50))
        // console.log(getfaxs);

    res.json(getfaxs)


})


var storage = multer.diskStorage({
        destination: function(req, file, cb) {
            cb(null, 'public/uploads')
        },
        filename: function(req, file, cb) {
            cb(null, file.fieldname + '/' + file.originalname)
        },


    })
    // Multer Filter
var multerFilter = (req, file, cb) => {
    if (file.mimetype.split("/")[1] === "pdf") {
        cb(null, true);
    } else {
        cb(new Error("Not a PDF File!!"), false);
    }
};
var upload = multer({ storage: storage, fileFilter: multerFilter })
    // To Show Form of creating fax
router.get("/createfax",isAuth ,(req, res) => {
    res.render("createfax", { title: "إضافه مكاتبه جديده" , user:req.session.user });
});

router.post("/createnewfax", isAuth ,upload.fields([
    { name: "reply" },
    { name: "faxContent" }
]), async(req, res) => {

    console.log("in creat route");
    console.log(req.body);
    console.log(req.files);
    console.log("in creat route");

    if (req.files["reply"]) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log("===".repeat(50))
                console.log(errors.errors);
                var validationMasseges = [];
                for (let i = 0; i < errors.errors.length; i++) {
                    validationMasseges.push(errors.errors[i].msg)
                }
                console.log(validationMasseges);
                req.flash("errorFax", validationMasseges);
                res.redirect("/createnewfax" )
                return;
            }
            const newfax = new Fax({
                numberOfFax: req.body.numberOfFax,
                from: req.body.from,
                branch: req.body.branch,
                subject: req.body.subject,
                signature: req.body.signature,
                reply: req.files["reply"][0].originalname,
                faxContent: req.files["faxContent"][0].originalname
            });
            await newfax.save(newfax);
            console.log(newfax);
            res.redirect("/" )
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            req.flash("messages", "تم الأضافه")
            const newfax = new Fax({
                numberOfFax: req.body.numberOfFax,
                from: req.body.from,
                branch: req.body.branch,
                subject: req.body.subject,
                signature: req.body.signature,
                reply: "noreply.pdf",
                faxContent: req.files["faxContent"][0].originalname
            });
            await newfax.save(newfax);
            console.log(newfax);
            res.redirect("/")
        } catch (err) {
            console.log(err);
        }

    }


});


router.delete("/deletefax/:id",isAuth ,async(req, res) => {
    const { id } = req.params;
    const fax = await Fax.findById(id)
    console.log("==".repeat(50));
    console.log("this is fax" + fax);
    if (fax) {
        await Fax.findByIdAndRemove(id);
        res.redirect("/getallfaxes" , {user:req.session.user})
    } else {
        console.log("this fax is not exist");
    }
})

router.get("/editfax/:id", isAuth ,async(req, res) => {
    const { id } = req.params
    const fax = await Fax.findById(id)
    console.log(fax)
    res.render("editfax", { fax, title: "تعديل علي مكاتبه"  , user:req.session.user});
});

router.put("/editfax/:id", upload.fields([
    { name: "reply" },
    { name: "faxContent" }
]), async(req, res) => {
    const { id } = req.params;
    const fax = await Fax.findById(id)
    console.log("==".repeat(50));
    console.log("this is fax" + fax);

    if (fax) {
        if (req.files["reply"]) {
            await Fax.findByIdAndUpdate(id, {
                numberOfFax: req.body.numberOfFax,
                from: req.body.from,
                branch: req.body.branch,
                subject: req.body.subject,
                signature: req.body.signature,
                reply: req.files["reply"][0].originalname,
                faxContent: req.files["faxContent"][0].originalname
            });
            res.redirect("/")
        } else {
            await Fax.findByIdAndUpdate(id, {
                numberOfFax: req.body.numberOfFax,
                from: req.body.from,
                branch: req.body.branch,
                subject: req.body.subject,
                signature: req.body.signature,
                reply: "noreply.pdf",
                faxContent: req.files["faxContent"][0].originalname
            });
            res.redirect("/")

        }
    } else {
        console.log("this fax is not exist");
    }
})

router.get("/showfax/:id", isAuth ,async(req, res) => {
    try {
        const fax = await Fax.findById(req.params.id);
        if (fax) {
            res.render('show', { fax, title: "عرض مكاتبة", moment, mes: "لايوجد"  , user:req.session.user})
        } else {
            console.log("not found");
        }
    } catch (err) {
        console.log(err);
    }
})


// check is Signin or not

function isSignIn(req, res, next) {
    if (!req.isAuthenticated()) {
        res.redirect("signin")
        return;
    }
    next()
}
module.exports = router