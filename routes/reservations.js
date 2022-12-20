var express = require('express');
var router = express.Router();
const url = require('url');
var monk= require('monk');
var ObjectId = require('mongodb').ObjectId; 
var db=monk('localhost:27017/atithi');
/* GET home page. */


//Make a reservation
router.post('/', function(req, res) {
	var collection = db.get('properties');
	booking_start_date = new Date(req.body.start_date);
	booking_end_date = new Date(req.body.end_date);
	console.log(booking_start_date);
	console.log(booking_end_date)
	collection.findOne({_id: req.body.property_id}, function(err, property){
		if(err) return err;
		var reservation_list = property.reservation_ids;
		console.log(property);
		console.log(reservation_list);
		var flag = true;
		var collection = db.get('reservations');
		collection.find({_id: {$in: reservation_list}},
			 {reservation_status: {$ne: "cancelled"}}, function(err2, res2){
				if(err2) return err2;
				console.log(res2);
				for(reserv of res2){
					res_start_date = reserv.start_date;
					res_end_date = reserv.end_date;
					if((booking_start_date >= res_start_date && booking_start_date < res_end_date)
					|| (booking_end_date > res_start_date && booking_end_date <= res_end_date)){
						flag = false;
						res.json({"reservations_status": "Not Available"});
						return;
					}
				}


				var collection=db.get('reservations');
				collection.insert({ 
				guest_email: req.body.guest_email,
				host_email: req.body.host_email,
				property_id: req.body.property_id,
				start_date: new Date(req.body.start_date),
				end_date: new Date(req.body.end_date),
				property_title: req.body.property_title,
				property_photo: req.body.property_photo,
				comment: "",
				rating: "",
				comment_date: "",
				reservations_status: "booked",
				created_time: new Date()
		
		
			}, function(err, reservations){
				if (err) throw err;
				// if insert is successfull, it will return newly inserted object
		
				// Add reservation to users  - reservation list
				var collection = db.get("users")
				collection.update({email: reservations.guest_email},
					{$push: {reservations_ids: reservations._id}}, function(err1, res1){
				   if(err1) return err1;
				//    console.log("pushed the reservation id to the user list");
			   })
		
				// Add reservation to properties  reservation list
				var collection = db.get("properties")
				collection.update({_id: reservations.property_id},
					{$push: {reservation_ids: reservations._id}}, function(err1, res1){
				   if(err1) return err1;
				//    console.log("pushed the reservation id to the property list");
			   })
		
				  res.json(reservations);
				  return;
			});

			
			 });


		 });
	 
  
});


// // Check availability of property for a reservation
// router.get('/checkAvailability/:property_id', function(req, res){
// 	var collection = db.get('properties');
// 	booking_start_date = new Date(req.body.start_date);
// 	booking_end_date = new Date(req.body.end_date);
// 	console.log(booking_start_date);
// 	console.log(booking_end_date)
// 	collection.findOne({_id: req.params.property_id}, function(err, property){
// 		if(err) return err;
// 		var reservation_list = property.reservation_ids;
// 		console.log(property);
// 		console.log(reservation_list);
// 		var collection = db.get('reservations');
// 		collection.find({_id: {$in: reservation_list}},
// 			 {reservation_status: {$ne: "cancelled"}}, function(err2, res2){
// 				if(err2) return err2;
// 				console.log(res2);
// 				for(reserv of res2){
// 					res_start_date = reserv.start_date;
// 					res_end_date = reserv.end_date;
// 					if((booking_start_date >= res_start_date && booking_start_date < res_end_date)
// 					|| (booking_end_date > res_start_date && booking_end_date <= res_end_date)){
// 						res.send("Not Available");
// 						return;
// 					}
// 				}

// 			res.send("Available");
// 			 })

// 	})
// });


// Get all reservations of the user using his gmail id
router.get('/:id', function(req, res) {
  var collection=db.get('reservations');
	collection.find({ guest_email: req.params.id }, function(err, reservations){
		console.log(reservations)
	if (err) throw err;
	res.json(reservations);
	});
});

// router.put('/cancel/:id', function(req, res) {
// 	var collection=db.get('reservations');
// 	collection.update({ guest_email: req.params.id}, {$set: {'reservations_status':"cancelled"}}, function(err, reservations){
// 	  if (err) throw err;
// 	  res.send("user cancelled successfully");
// 	  });
//   });

//   router.put('/comment/:id', function(req, res) {
// 	var collection=db.get('reservations');
// 	// console.log(req)
// 	collection.update({ guest_email: req.params.id}, {$set: {'comment':req.body.comment, 'rating':req.body.rating, 'comment_time':new Date()}}, function(err, reservations){
// 	  if (err) throw err;
// 	  res.send("user commented successfully");
// 	  });
//   });

// Delete a reservation using its ID
router.delete('/:id', function(req, res) {
  var collection=db.get('reservations');

  collection.findOne({_id: req.params.id}, function(err1, res1){
	if(err1) return err1;

		// remove reservation id from the user
		var collection=db.get('users');

		collection.update({email: res1.guest_email}, {$pull: {
			reservations_ids:  res1._id
		}}, function(err2, res2){
			if(err2) return err2;
			// res.send("Removed reservation from user");
		});
	
	
		// remove reservation id from the property
		var collection=db.get('properties');

		collection.update({_id: res1.property_id}, {$pull: {
			reservation_ids:  res1._id
		}}, function(err3, res3){
			if(err3) return err3;
			// res.send("Removed reservation from property");
		});
	
  });

  collection.findOneAndDelete({_id: req.params.id}, function(err4, res2){
	if(err4) throw err4;


	res.send("Reservation successfully deleted");
});
//   collection.findOne({_id: req.params.id}, function(err, res1){
// 	if(err) throw err;
// 	var nowDate = new Date();
// 	var reservDate = res1.start_date;
// 	var diff = (reservDate-nowDate)/3600000;
// 	// console.log("diff in hours is");
// 	// console.log(diff);
// 	if(diff >= 48){
// 		collection.findOneAndDelete({_id: req.params.id}, function(err, res2){
// 			if(err) throw err;
// 			res.send("Reservation successfully deleted");
// 		});
// 	}else{
// 		res.send("Less than 48 hours left for the reservation or start date has passed. No cancellations allowed now.");
// 	}
//   });
});


module.exports = router;
