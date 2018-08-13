var express = require("express");
var Catalog = require('../models/catalog');

class Api {
    constructor(app, config) {
        this.config = config;
        this.app = app;

        var router = express.Router();
        this.app.use("/", router);

        router.get('/sections', (req, res) => {
            Catalog.find({}, 'type description number').exec(function (err, sections) {
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
            Catalog.findOne({ "number": req.params.number }).exec(function (err, section) {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                if (!section) {
                    console.log("Section not found.");
                    res.send("Section not found.");
                }

                //Section Found
                res.send(section);
            });
        });

        router.post('/add/:sectionNumber', (req, res) => {
            Catalog.findOne({ "number": req.params.sectionNumber }).then(function (section) {
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
    }
}
module.exports = Api;
