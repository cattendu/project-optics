var express = require("express");
var route = express.Router();

/*var Product = require('../models/product');

route.get('/products', (req, res) => {
    Product.find({}).then(function(products){
        res.send(products);
    });
});

route.get('/product/:id', (req, res) => {
    Product.findById({_id:req.params.id}).then(function(product){
        res.send(product); 
    });
});

route.post('/products', (req, res) => {
    Product.create(req.body).then(function(product){
        res.send(product);
    });
});

route.put('/product/:id', (req, res) => {
    Product.findByIdAndUpdate({_id: req.params.id}, req.body).then(function(product){
        Product.findOne({_id: req.params.id}).then(function(product){
            res.send(product);
        });
    });
});

route.delete('/product/:id', (req, res) => {
    Product.findByIdAndRemove({_id: req.params.id}).then(function(product){
        res.send(product);
    });
});*/

module.exports = route;