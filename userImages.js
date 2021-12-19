
module.exports = (function () {
    var express = require("express");
    var router = express.Router();

    /* Find images based on user email  */
    function getSomeImages(filter, res, mysql, context) {
        var query = `SELECT images.imageID, images.imageLink, images.imageTagOne, images.imageTagTwo, images.imageTagThree, images.imageTagFour FROM images WHERE images.userEmail = "${filter.q}";`;
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

    router.get("/", function (req, res) {
        var context = {};
        var mysql = req.app.get("mysql");
        console.log(req.query);

        filter = req.query;
        getSomeImages(filter, res, mysql, context);
    });


    /* Update image tags by imageID */
    router.put("/", function (req, res) {
        var context = {};
        console.log(req.body);

        var mysql = req.app.get("mysql");
        var sql = `UPDATE images SET imageTagOne=?, imageTagTwo=?, imageTagThree=?, imageTagFour=? WHERE imageID=?`;
        var inserts = [
            req.body.data.imageTagOne,
            req.body.data.imageTagTwo,
            req.body.data.imageTagThree,
            req.body.data.imageTagFour,
            req.body.data.imageID,
        ];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error);
                res.write(JSON.stringify(error));
                res.end();
            } else {
                context.images = JSON.stringify(results);
                res.send(context);
            }
        });
    });


    /* Delete image row */
    router.delete('/', (req, res) => {
        var context = {};
        let id = req.body.imageID;
        let queryString = `DELETE FROM images WHERE imageID = ${id}`;
        console.log(queryString);
    
        var mysql = req.app.get("mysql");
        mysql.pool.query(
          queryString,
          (error, results, fields) => {
            if (error) {
              res.write(JSON.stringify(error));
              res.status(400);
              res.end();
            } else{
            context.images = JSON.stringify(results);
            res.send(context);
            }
          }
        );
      });
    
    return router;
})();