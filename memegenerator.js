const AWS = require("aws-sdk");
const { options } = require("./uploadImage");
const dotenv = require("dotenv");

dotenv.config();

const s3 = new AWS.S3({
  accessKeyId: process.env.ID,
  secretAccessKey: process.env.SECRET,
  region: process.env.REGION,
});

module.exports = (function () {
  var express = require("express");
  var router = express.Router();
  const { DownloaderHelper } = require("node-downloader-helper");
  const memeMaker = require("meme-maker");
  var gm = require("gm");
  var fs = require("fs");

  const uploadFile = (filePath, fileName) => {
    // Read content from the file
    const fileContent = fs.readFileSync(filePath);

    // Setting up S3 upload params
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: fileContent,
      ACL: "public-read",
    };

    // Uploading files to the bucket
    s3.upload(params, function (err, data) {
      if (err) {
        throw err;
      }
      console.log(`File uploaded successfully. ${data.Location}`);
    });
  };

  router.post("/", function (req, res) {
    /* get random image with the tag "pets" */
    var query = `SELECT imageLink FROM images WHERE imageTagOne = 'pets' OR imageTagTwo = 'pets' OR imageTagThree = 'pets' OR imageTagFour = 'pets' ORDER BY RAND() Limit 1`;
    var mysql = req.app.get("mysql");

    mysql.pool.query(query, function (error, results, fields) {
      if (error) {
        res.write(JSON.stringify(error));
        res.end();
      }

      const dest = "tempImage.jpg";
      const curMeme =
        "meme-" + (Math.floor(Math.random() * 10000) + 1) + ".jpg";
      const imageLink = results[0].imageLink;
      console.log(imageLink);

      // Download image locally
      const dlOptions = {
        fileName: dest,
        override: true,
      };
      const dl = new DownloaderHelper(imageLink, __dirname, dlOptions);
      dl.start();

      dl.on("end", () => {
        // Resize image
        gm(__dirname + "/" + dest)
          .resize(800)
          .quality(70)
          .write(dest, function (err) {
            if (err) return console.log(err);
          });
      });

      // Create meme and save it locally
      const options = {
        image: __dirname + "/" + dest,
        outfile: __dirname + "/" + curMeme,
        topText: req.body.topText,
        bottomText: req.body.bottomText,
      };

      memeMaker(options, function (err) {
        console.log("Image saved: " + options.outfile);

        // upload the meme to Amazon S3
        uploadFile(process.env.TEMP_LOCATION + curMeme, curMeme);

        // Get the Link to the new meme on S3 and send it in response
        const imageURL = process.env.AMAZON_S3_URL + curMeme;

        res.send(imageURL);
      });
    });
  });

  return router;
})();
