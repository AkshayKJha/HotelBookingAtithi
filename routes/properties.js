var express = require('express');
var router = express.Router();

let properties_api = require("./users");

var monk= require('monk');
const { request } = require('express');

var db=monk('localhost:27017/atithi');


// add a property
router.post('/', async(req, res) => {
	//req.body is used to read form input
  var collection=db.get('properties');
	collection.insert({ 
		email: req.body.email,
		title: req.body.title,
		description: req.body.description,
		property_type: req.body.property_type,
		city: req.body.city,
		state: req.body.state,
		country: req.body.country,
		zipcode: req.body.zipcode,
		street: req.body.street,
		daily_fee: req.body.daily_fee,
		thumbnail: req.body.thumbnail,
		amenities: req.body.amenities,
		reservation_ids: [],
		cleaning_fee: req.body.cleaning_fee,
		bedrooms: req.body.bedrooms,
		bathrooms: req.body.bathrooms,
		available: "yes",
		rating_and_comments:[]

	}, function(err, properties){
		if (err) throw err;
		// if insert is successfull, it will return newly inserted object

		// Add a property as favorite
		var collection=db.get('users');
		// console.log(properties)
		collection.update({email: properties.email}, {$set: {
			owns_properties:  true
		}}, function(err2, res2){
			if(err2) return err2;
			// res.send("Added property as a favorite");
			// console.log("added property as owned")
		});


		collection.update({email: properties.email},
			 {$push: {properties_list: properties._id}}, function(err1, res1){
			if(err1) return err1;
			// console.log("pushed the property id to the user list");
		})

		// console.log()
	  	res.json(properties);
	});
});

// get all properties
router.get('/', function(req, res) {
	var collection=db.get('properties');
	collection.find({available: "yes"}, function(err, properties){
		if (err) throw err;
		res.json(properties);
	});
  });

// Get one property

router.get('/:id', function(req, res) {
	var collection=db.get('properties');
	  collection.findOne({ _id: req.params.id }, function(err, property){
		  if (err) throw err;
		  res.json(property);
	  });
  });

// update property details

// edit a property
router.put('/:id', function(req, res) {
	//req.body is used to read form input
  var collection=db.get('properties');

  collection.update({_id: req.params.id}, {$set: {
	title: req.body.title,
	description: req.body.description,
	property_type: req.body.property_type,
	city: req.body.city,
	state: req.body.state,
	country: req.body.country,
	zipcode: req.body.zipcode,
	street: req.body.street,
	daily_fee: req.body.daily_fee,
	thumbnail: req.body.thumbnail,
	amenities: req.body.amenities,
	cleaning_fee: req.body.cleaning_fee,
	bedrooms: req.body.bedrooms,
	bathrooms: req.body.bathrooms,
  }}, function(err, res1){
	if(err) return err;
	res.send("Values updated successfully");
  });

});

// soft delete property from the system
router.put('/softdelete/:id', function(req, res) {
	//req.body is used to read form input
  var collection=db.get('properties');

  collection.update({_id: req.params.id}, {$set: {
	available: "no",
  }}, function(err, res1){
	if(err) return err;
	res.send("property soft deleted from the system");
  });

});


// rate a property
router.put('/rate_and_comment/:id', function(req, res) {
	//req.body is used to read form input
  var collection=db.get('properties');
	console.log("rating and commenting init")
  collection.update({_id: req.params.id}, {$push: {
	rating_and_comments: {
		"rating": req.body.rating,
		"comment": req.body.comment,
		"name": req.body.name,
		"date": new Date()
	}
  }}, function(err, res1){
	if(err) return err;
	res.send("rating added to the property");
  });
   // console.log("pushed the property id to the user list");
})

// });



/* GET home page. */






// router.get('/:id/edit', function(req, res) {
//   var collection=db.get('properties');
// 	collection.findOne({ _id: req.params.id }, function(err, property){
// 		if (err) throw err;
// 	  	res.render('edit_prop', { property: property });
// 		//res.json(result);
// 	});
// });

// router.post('/:id', function(req, res) {
// 	//req.body is used to read form input
//   var collection=db.get('properties');
//   var newvalues = { $set: {
//     title: req.body.title,
// 		street: req.body.street,
//     city: req.body.city,
//     state: req.body.state,
//     country: req.body.country,
// 		thumbnails: req.body.image,
// 		description:req.body.desc
//   }
//    };
//   collection.findOneAndUpdate({ _id: req.params.id }, newvalues, function(err, res1) {
//     if (err) throw err;
//     console.log("1 document updated");
// 		res.redirect('/properties');
// 	});
// });

// router.delete('/:id', function(req, res) {
// 	//req.body is used to read form input
//   var collection=db.get('properties');
//   collection.findOneAndDelete({ _id: req.params.id }, function(err, res1) {
//     if (err) throw err;
//     // console.log("1 document deleted");
// 		res.redirect('/properties');
// 	});
// });


module.exports = router;
