const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
    questions:[{type:String}],

    name:{type:String,required:true}

})


const Test = mongoose.model('Test', testSchema);
module.exports = Test;