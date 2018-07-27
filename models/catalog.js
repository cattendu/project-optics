var mongoose = require("mongoose");
var Schema = mongoose.Schema;

//if more than 1 elem in arrays, conditions are checked with boolean OR between them
var conditionSchema = new Schema({
    partId: { type: String },
    acceptedValues: { type: [String] }
},{ _id : false});

//if more than 1 elem in 'conditions', evaluate with boolean AND between each condition
var optionSchema = new Schema({
    value: {type: String},
    description: {type: String},
    conditions: { type: [conditionSchema] },

    group: {type: Number} //If more than one option group is required
},{ _id : false });

var partSchema = new Schema({
    id: {type: String},
    type: { type: String, enum: ['constant', 'numeric', 'select', 'color'], required: true},
    placeholder: { type: String, required: true }, // ex: FA-, A, B, EE, NNN
    description: { type: String }, // ex: LEAD LENGTH   
    color: { type: String, enum: ['default','deep-orange', 'light-green', 'light-red', 'light-blue', 'light-purple', 'light-yellow', 'deep-blue', 'deep-green', 'deep-red', 'light-orange', 'deep-purple', 'pink', 'deep-yellow', 'sky-blue']},
    integersLength: { type: Number }, //number of expected digits
    decimalsLength: { type: Number }, //number of expected digits
    options: [optionSchema],

    columns: {type: Number, default: 1}, //Number of columns in which options should be shown

    max: { type: Number }, //maximum allowed value
    min: { type: Number }, //minimum allowed value

    optionsGroup1Title: { type: String },
    optionsGroup2Title: { type: String }
},{ _id : false });

var productSchema = new Schema({
    type: {type: String, required: true}, //ex: FA, IP, WNC, DC
    dataSheet: {type: String, required: true},
    description: {type: String, required: true},
    parts: [partSchema]
},{ _id : false });

var sectionSchema = new Schema({
    type: { type: String, enum: ['copper', 'fiber', 'other']},
    description: {type: String, required: true},
    number: {type: Number, required: true},
    products: [productSchema]
}, {collection: 'catalog'});

var Catalog = mongoose.model('Catalog', sectionSchema);

module.exports = Catalog;