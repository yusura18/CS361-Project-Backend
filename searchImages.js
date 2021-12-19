module.exports = (function () {
    var express = require("express");
    var router = express.Router();

    /* Find images based on search filter and a given string in the req */
    function getSomeImages(filter, res, mysql, context) {
        var query = `SELECT imageID, imageLink FROM images WHERE imageTagOne REGEXP "${filter.q}" OR imageTagTwo REGEXP "${filter.q}" OR imageTagThree REGEXP "${filter.q}" OR imageTagFour REGEXP "${filter.q}";`;
        console.log(query);

        mysql.pool.query(query, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.images = JSON.stringify(results);
            res.setHeader("Content-Type", "application/json");
            console.log(context);
            res.send(context);
        });
    }

    /* Get images */
    router.get("/", function (req, res) {
        var context = {};
        var mysql = req.app.get("mysql");
        console.log(req.query);

        filter = req.query;
        getSomeImages(filter, res, mysql, context);
    });   

    return router;
})();