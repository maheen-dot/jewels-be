const mongoose = require("mongoose");
const reviewschema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    userName:{
        type:String,
        required: true,
    },
    rating:{
        type:Number,
        required: true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
})
module.exports = mongoose.model("Review", reviewschema)