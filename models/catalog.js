var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var conditionSchema = new Schema({
    partId: { type: String },
    optionValue: { type: String }
},{ _id : false});

var constraintSchema = new Schema({
    conditions: [conditionSchema],
    forcedValue: { type: String}
},{ _id : false });

var optionSchema = new Schema({
    value: {type: String},
    description: {type: String}
},{ _id : false });

var partSchema = new Schema({
    id: {type: String},
    type: { type: String, enum: ['constant', 'numeric', 'select'], required: true},
    placeholder: { type: String, required: true }, // ex: FA-, A, B, EE, NNN
    description: { type: String }, // ex: LEAD LENGTH   
    color: { type: String, enum: ['default','deep-orange', 'light-green', 'light-red', 'light-blue', 'light-purple', 'light-yellow', 'deep-blue', 'deep-green', 'deep-red', 'light-orange', 'deep-purple', 'pink', 'deep-yellow']},
    allowDecimals: { type: Boolean },
    expectedLength: { type: Number }, //number of expected digits
    options: [optionSchema],
    constraints: [constraintSchema]
},{ _id : false });

var productSchema = new Schema({
    type: {type: String, required: true}, //ex: FA, IP, WNC, DC
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