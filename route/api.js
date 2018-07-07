var express = require("express");
var router = express.Router();

var Sections = require('../models/catalog');

router.get('/sections', (req, res) => {
    Sections.find({}, 'type description number').exec(function (err, sections) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        if (!sections) {
            console.log("Sections not found.");
            res.send("Sections not found.");
        }
        //Sections Found
        res.send(sections);
    });
});

router.get('/section/:number', (req, res) => {
    Sections.findOne({ "number": req.params.number }).exec(function (err, section) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        if (!section) {
                console.log("QUERY GET_TYPE: PartNumber not found.");
                res.send("QUERY GET_TYPE: PartNumber not found.");
            }

        //Section Found
        res.send(section);
    });
});

router.get('/catalog/:sectionNumber/:productType', (req, res) => {
    Sections.findOne({ "number": req.params.sectionNumber }).exec(function (err, section) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        if (!section) {
            console.log("QUERY GET_TYPE: PartNumber not found.");
            res.send("QUERY GET_TYPE: PartNumber not found.");
        }

        //Section Found
        for(let product of section.products){
            if (product.type.toUpperCase() == req.params.productType.toUpperCase()){
                //Product Found
                return res.send(product);              
            }
        }

        //Product Not Found
        console.log("Product Not Found");
        res.send("Product Not Found");
    });
});

router.get('/partNumber/:type', (req, res) => {
    Sections.find().byType(req.params.type)
    .exec(function(err, partNumber){
        if(err){
            console.log(err);
            res.send(err);
        }
        if(!partNumber){
            console.log("QUERY GET_TYPE: PartNumber not found.");
            res.send("QUERY GET_TYPE: PartNumber not found.");
        }

        //PartNumber Found
        res.send(partNumber);
    });
});

router.post('/constants/:type', (req, res) => {
    Sections.findOne({"type":req.params.type}).then(function(partNumber){
        var elems = req.body;
        for(var i = 0; i < elems.length; i++)       
            partNumber.constants.push(elems[i]);      
        
        partNumber.save(function (err) {
            if (err) return handleError(err);
        });
        res.send(partNumber);  
    });
});

router.post('/selects/:type', (req, res) => {
    Sections.findOne({"type":req.params.type}).then(function(partNumber){
        var elems = req.body;
        for(var i = 0; i < elems.length; i++)       
            partNumber.selects.push(elems[i]);      
        
        partNumber.save(function (err) {
            if (err) return handleError(err);
        });
        res.send(partNumber);  
    });
});

router.post('/numerics/:type', (req, res) => {
    Sections.findOne({"type":req.params.type}).then(function(partNumber){
        var elems = req.body;
        for(var i = 0; i < elems.length; i++)       
            partNumber.numerics.push(elems[i]);      
        
        partNumber.save(function (err) {
            if (err) return handleError(err);
        });
        res.send(partNumber);  
    });
});

router.post('/add', (req, res) => {
    var sections = req.body;
    console.log(sections);

    for (let section of sections) {
        Sections.create(section);
    }

    res.send(sections);
});

router.post('/add/:sectionNumber', (req, res) => {
    Sections.findOne({ "number": req.params.sectionNumber }).then(function (section) {
        var products = req.body;

        for (let product of products) {
            console.log(product);
            section.products.push(product);
        }

        section.save(function (err) {
            if (err)
            console.log(err);
            res.send("error");
        });
    });
});

router.get('/addConstraint/:sectionNumber/:productType/:', (req, res) => {
    Sections.findOne({ "number": req.params.sectionNumber }).then(function (section) {

        for (let product of section.products) {
            if (product.type == req.params.productType){
                console.log(product);
                res.send(product);
                return;
            }
        }
    });
});


router.post('/addProduct/:sectionNumber', (req, res) => {
    Sections.findOne({ "number": req.params.sectionNumber }).then(function (section) {
        var product = req.body;

        console.log(product);

        section.products.push(product);
    
        section.save(function (err) {
            if (err){

                console.log(err);
                return handleError(err);
            }
        });
    });
});


/*
router.post('/partNumber/:type/:placeholder', (req, res) => {
    PartNumber.find({'type':req.params.type.toUpperCase()} , function(err, partNumber){
        if(err){
            console.log(err);
            res.send(err);
            return;
        }
        if(partNumber.length == 0){
            console.log("QUERY RESULT: PartNumber not found.");
            res.send("QUERY RESULT: PartNumber not found.");
            return; 
        }

        //PartNumber Found
        let category = partNumber[0].categories.filter(function(category){
            return category.placeholder === req.params.placeholder.toUpperCase();
        });

        if(category.length == 0){
            console.log("QUERY RESULT: Category not found.");
            res.send("QUERY RESULT: Category not found.");
            return;
        }

        //Category Found
        var partsToInsert = req.body;

        for(var i = 0; i < partsToInsert.length; i++)       
            category[0].parts.push(partsToInsert[i]);      
        
        partNumber[0].save(function (err) {
            if (err) return handleError(err);
        });
        res.send(partNumber);

    });
});

router.post('/partNumber/:type', (req, res) => {
    PartNumber.findOne({"type":req.params.type}).then(function(partNumber){
        var elems = req.body;
        for(var i = 0; i < elems.length; i++)       
            partNumber.categories.push(elems[i]);      
        
        partNumber.save(function (err) {
            if (err) return handleError(err);
        });
        res.send(partNumber);  
    });
});
*/


module.exports = router;
