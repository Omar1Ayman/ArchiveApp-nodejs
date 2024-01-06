const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");


const userSchema = new Schema({
    name:{
        type:String,
        unique:true,
        trim:true,
        lowercase:true,
        min:5,
        required:true
    },
    password:{
        type:String,
        required:true,
        min:6,
        trim:true
    },
    role:{
        type:String,
        enum:["admin" , "user"],
        default:"user"
    }
},{timestamps:true});


userSchema.methods.hashPassword = function(password){
    return bcrypt.hashSync(password , bcrypt.genSaltSync(10) , null)
}

userSchema.methods.Comparepassword = function(password){
    return bcrypt.compareSync(password , this.password);
}

// userSchema.pre("save" , async function(next){
//     const salt = await bcrypt.genSalt(10)
//     const hashed = bcrypt.hash(this.password , salt);
//     this.password = hashed
//     next()
// })
module.exports = mongoose.model("User", userSchema);