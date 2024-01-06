const mongoose = require("mongoose");

const FaxSchema = new mongoose.Schema({
        numberOfFax: {
            type: String,
            required: true,
            trim: true
        },
        from: {
            type: String,
            required: true,
            trim: true,
        },
        branch: {
            type: String,
            required: true,
            trim: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        signature: {
            type: String,
            trim: true,
            default: "لم يتم التأشير"
        },
        reply: {
            type: String,
            trim: true,
            default: "/reply/noreply.pdf"
        },
        faxContent: {
            type: String,
            required: true,
        }

    }, {
        timestamps: true
    }

);

module.exports = mongoose.model("Fax", FaxSchema);