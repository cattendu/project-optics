var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var productSchema = new Schema({
    productId: {type: Number, required: true},
    productName: {type: String, required: true},
    productQuantity: {type: Number, required: true}
});

var Product = mongoose.model('product', productSchema);

module.exports = Product;