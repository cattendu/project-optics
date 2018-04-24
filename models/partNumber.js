var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var restrictionSchema = new Schema({
    categoryId: {type: Schema.Types.ObjectId, required: true},
    partId: {type: Schema.Types.ObjectId, required: true},
    categoryName: {type: String},
    optionName: {type: String}
});

var warningSchema = new Schema({
    categoryId: {type: Schema.Types.ObjectId, required: true},
    partId: {type: Schema.Types.ObjectId, required: true},
    categoryName: {type: String},
    optionName: {type: String}
});

var partSchema = new Schema({
    value: {type: String},
    description: {type: String},
    restrictions: [restrictionSchema],
    warnings: [warningSchema]
});

var partCategorySchema = new Schema({
    placeholder: {type: String}, // ex: A, B, NNN
    description: {type: String}, // ex: FIBER TYPE
    parts: {type: [partSchema]}
});

var partNumberSchema = new Schema({
    type: {type: String, required: true}, //ex: FA, IP, WNC
    categories: {type: [partCategorySchema]}
});

var PartNumber = mongoose.model('PartNumber', partNumberSchema);

module.exports = PartNumber;