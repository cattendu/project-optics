var express = require("express");
var router = express.Router();

var PartNumber = require('../models/partNumber');

router.get('/', (req, res, next) => {
    console.log("get_/");
    PartNumber.find({}, (err, partNumbers) => {
        res.send(partNumbers);
    });
});

router.get('/partNumbers', (req, res) => {
    console.log("get_partNumbers");
    PartNumber.find({}, (err, partNumbers) => {
        res.send(partNumbers);
    });
});

router.get('/partNumber/:type', (req, res) => {
    console.log("get_:type");
    PartNumber.findOne({'type':req.params.type.toUpperCase()} , function(err, partNumber){
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

router.post('/partNumber/:type/:template', (req, res) => {
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
            return category.template === req.params.template.toUpperCase();
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

module.exports = router;
