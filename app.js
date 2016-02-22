var express = require('express')
  

, app = express() // Web framework to handle routing requests
 

, cons = require('consolidate') // Templating library adapter for Express
  
,mongojs = require('mongojs')
, MongoClient = require('mongodb').MongoClient // Driver for connecting to MongoDB
  

, routes = require('./routes'); // Routes for our application
var db2=mongojs('urban',['inventory']);
MongoClient.connect('mongodb://localhost:27017/urban', function(err, db) {
 

   "use strict";
    if(err) throw err;

  

  // Register our templating engine
  

  app.engine('html', cons.swig);
  

  app.set('view engine', 'html');
  

  app.set('views', __dirname + '/views');

    

  app.use('/static',express.static('public'));	

// Express middleware to populate 'req.cookies' so we can access cookies
   

 app.use(express.cookieParser());

   

 // Express middleware to populate 'req.body' so we can access POST variables
   
var bodyParser = require('body-parser');

app.use(bodyParser.json());
 app.use(express.bodyParser());
    app.use(express.static(__dirname + '/views'));
    
/*app.post('/itemlist', function (req, res) {
  console.log(req.body);
  db2.inventory.insert(req.body, function(err, doc) {
    res.json(doc);
  });
});
    

// Application routes
  
app.get('/itemlist', function (req, res) {
  console.log('I received a GET request');

  db2.inventory.find(function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
});
*/
  routes(app, db);

    

var server=app.listen(8082);


   console.log('Express server listening on port 8082');
});

