const express = require('express');
const app = express();
const cors = require("cors");
const mysql = require('./dbcon');
const dotenv = require('dotenv');

dotenv.config();

// Set up app and express
app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.set('port', 6511);
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + '/my-uploads'));
app.set('mysql', mysql);
app.use('/memegenerator', require('./memegenerator.js'));
app.use('/searchImage', require('./searchImages.js'));
app.use('/uploadImage', require('./uploadImage.js'));
app.use('/userimages', require('./userImages.js'));



// Error handlers
app.use(function(req,res){
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
  });
  
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.send('500 - Server Error');
  });
  
  app.listen(app.get('port'), function(){
    console.log(`Express started on http://extra2:${app.get('port')}; press Ctrl-C to terminate.`);
  });