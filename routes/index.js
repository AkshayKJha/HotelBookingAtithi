var express = require('express');
var router = express.Router();


var monk= require('monk');

var db=monk('localhost:27017/atithi');

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  // res.redirect('properties');
  collection = db.get('users');
  collection.find({}, function(err, users){
    if (err) throw err;
    // res.json(properties);
    res.render('index',{users:users})
});
  // res.render('index')
});

module.exports = router;

// var express = require('express');
// var router = express.Router();


// var monk = require('monk');
// var db = monk('localhost:27017/vidzy');
// var collection = db.get('videos');

// router.get('/', function(req, res) {
// 	res.render('index', { title: 'Express'} );

// });

// router.get('/videos', function(req, res) {
// 	collection.find({}, function(err, results){
// 		if (err) throw err;
// 		res.render('index', { videos: results } );
// 		//res.json(results);
// 	});
// });









// module.exports = router;