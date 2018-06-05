var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var restrictionSchema = new Schema({
    sectionDescription: {type: String},
    forcedValue: {type: String}
},{ _id : false });

var optionSchema = new Schema({
    value: {type: String},
    description: {type: String},
    restrictions: [restrictionSchema]
},{ _id : false });

var partSchema = new Schema({
    type: { type: String, enum: ['constant', 'numeric', 'select'], required: true},
    placeholder: { type: String, required: true }, // ex: FA-, A, B, EE, NNN
    description: { type: String }, // ex: LEAD LENGTH   
    color: { type: String, enum: ['default','deep-orange', 'light-green', 'light-red', 'light-blue', 'light-purple', 'light-yellow', 'deep-blue', 'deep-green', 'deep-red', 'light-orange', 'deep-purple', 'pink', 'deep-yellow']},
    allowDecimals: { type: Boolean },
    expectedLength: { type: Number }, //number of expected digits
    
    options: [optionSchema]
},{ _id: false });

var productSchema = new Schema({
    type: {type: String, required: true}, //ex: FA, IP, WNC, DC
    description: {type: String, required: true},
    parts: [partSchema]
},{ _id: false });

var sectionSchema = new Schema({
    type: { type: String, enum: ['copper', 'fiber', 'other']},
    description: {type: String, required: true},
    number: {type: Number, required: true},
    products: [productSchema]
}, {collection: 'catalog'});

var Catalog = mongoose.model('Catalog', sectionSchema);

module.exports = Catalog;

/*
sectionSchema.query.byType = function(type){
    return this.findOne({'type':type.toUpperCase()});
};

//Returns an array of the placeholders value
catalogSchema.methods.getPlaceholders = function(){
    let placeholders = [];
    
    for(let category of this.categories){
        placeholders.push(category.placeholder);
    }

    return placeholders;
};

catalogSchema.methods.getPartCode = function(){
    let placeholders = this.getPlaceholders();
    let partCode = [];


    return partCode;
};

*/