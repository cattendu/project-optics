var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var restrictionSchema = new Schema({
    sectionDescription: {type: String},
    forcedValue: {type: String}
},{ _id : false });

var optionSchema = new Schema({
    value: {type: String, required: true},
    description: {type: String},
    restrictions: [restrictionSchema]
},{ _id : false });

var selectSchema = new Schema({
    placeholder: {type: String}, // ex: A, B, EE
    description: {type: String}, // ex: FIBER TYPE
    options: {type: [optionSchema]}
},{ _id : false });

var unitSchema = new Schema({
    description: {type: String, enum: ['meters','inches','feet','not applicable']},
    value: {type: String} //If unit type needs to be displayed in the partNumber code ex: M, F
},{ _id : false });

var numericSchema = new Schema({
    placeholder: {type: String}, // ex: NNN
    description: {type: String}, // ex: LEAD LENGTH
    allowDecimals: {type: Boolean, default: false},
    length: {type: Number, default: 3}, //number of expected digits
    units: {type: [unitSchema]}
},{ _id : false });

var constantSchema = new Schema({
    value: {type: String, required: true} //ex: FA-, -, MS-FC, AS-W
},{ _id : false });

var productSchema = new Schema({
    type: {type: String, required: true}, //ex: FA, IP, WNC, DC
    description: {type: String, required: true},
    constants: [constantSchema],
    selects: [selectSchema],
    numerics: [numericSchema]
},{ _id: false });

var sectionSchema = new Schema({
    type: { type: String, enum: ['Copper Products', 'Fiber Products', 'Other']},
    description: {type: String, required: true},
    number: {type: Number, required: true},
    products: [productSchema]
}, {collection: 'catalog'});

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


var Catalog = mongoose.model('Catalog', sectionSchema);

module.exports = Catalog;