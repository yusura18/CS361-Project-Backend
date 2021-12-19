const AWS = require("aws-sdk");
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
  var multer = require("multer");
  var multerS3 = require("multer-s3");

  const uploadS3 = multer({
    storage: multerS3({
      s3: s3,
      acl: "public-read-write",
      bucket: process.env.BUCKET_NAME,
      metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
      },
      key: (req, file, cb) => {
        cb(null, Date.now().toString() + "-" + file.originalname);
      },
    }),
  });

  const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpeg",
    "image/png": "png",
    "image/gif": "gif",
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "/my-uploads/");
    },

    filename: (req, file, cb) => {
      const ext = file.mimetype.split("/")[1];
      cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
  });

  const fileFilter = function (req, file, cb) {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      req.fileValidationError = "Only image files are allowed!";
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  };

  let upload = multer({ storage: storage }).single("imageData");

  /* Adds an image */
  router.post("/", uploadS3.single("imageData"), (req, res) => {
    // req.file contains info on uploaded file
    // req.body contains other fields

    // console.log(req.file);
    // console.log(req.body);
    var mysql = req.app.get("mysql");
    var sql =
      "INSERT INTO images (imageName, imageLink, userEmail, copyright, userCopyright, imageTagOne, imageTagTwo, imageTagThree, imageTagFour) VALUES (?,?,?,?,?,?,?,?,?)";

    var inserts = [
      req.body.imageName,
      req.file.location,
      req.body.userEmail,
      req.body.copright,
      req.body.userCopyright,
      req.body.imageTagOne,
      req.body.imageTagTwo,
      req.body.imageTagThree,
      req.body.imageTagFour,
    ];

    sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
      if (error) {
        console.log(JSON.stringify(error));
        res.end();
      } else {
        res.send(results);
      }
    });
  });

  return router;
})();
