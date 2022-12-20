var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');

const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{5,})");

var monk = require('monk');
const { response } = require('express');
var db = monk('localhost:27017/atithi');
var collection = db.get('users');

router.post('/register', async(req, res) => {
	try{
		const {first_name,last_name, email, password, phone, street, city, state, country, zipcode } = req.body;
		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		if(!(first_name && last_name && email && password)){

			res.status(422).json( { error: "All fields are required!" } );
		}
		else if(!regex.test(password)){
			res.status(422).json( { error: "Password must contain at least 1 lowercase alphabetical character, 1 uppercase alphabetical character, 1 numeric character,at least one special character. The password must be five characters or longer" } );
		}
		else{

			collection.findOne({ email: email }, function(err, user){
				if (err) throw err;

				if (user){
					res.status(425).json({ error : "User already exists. Please login!"} );

				}
				else{
						let newUser = {
							first_name: first_name,
							last_name: last_name,
							email: email,
							password: hashedPassword,
							phone: phone,
							owns_properties: false,
							street: street,
							city: city,
							state: state,
							country: country,
							zipcode: zipcode,
							reservations_ids: [],
							properties_list: [],
							favorites_list: []

						}
						collection.insert(newUser, function(err, user){
					
                     		if (err) throw err;
					 		/*var token = jwt.sign({ user_id: user._id, email}, 'secretkey');

					 		if (token){
								user.token = token;

					 		}*/
					 		res.json(user);

						})
				}
			});	

		}
	}
	catch(err){
		console.log(err.stack);
	}

});

router.post('/login', async(req, res) => {
	
	
	try{
		const {email, password } = req.body;
		if(!(email && password)){

			res.status(422).json({ error: "All fields are required!" } );
		}
		const userData = await collection.findOne({ email: email });
		if(userData == null){

			res.status(425).json({ error: "User doesn't exist" } );

		}
		const isMatched = await bcrypt.compare(password, userData.password);
		
		console.log("req "+password);
		//const hashedPassword = await bcrypt.hash(password, 10)
		if(isMatched){
			res.status(200).json(userData);
		}
		else{
			res.status(420).json( {error: "User email or password is incorrect!" } );
		}
	}
	catch(err){
		console.log(err.stack);
		//res.status(420).json( {error: "User email or password is incorrect!" } );
	}

});



// Add a property as favorite
router.put('/favorite/:id', function(req, res) {
	//req.body is used to read form input
  var collection=db.get('users');

  collection.update({email: req.params.id}, {$push: {
	favorites_list:  req.body.property_id
  }}, function(err, res1){
	if(err) return err;
	res.send("Added property as a favorite");
  });
});


// Remove a property as favorite
router.put('/unfavorite/:id', function(req, res) {
	//req.body is used to read form input
  var collection=db.get('users');

  collection.update({email: req.params.id}, {$pull: {
	favorites_list:  req.body.property_id
  }}, function(err, res1){
	if(err) return err;
	res.send("Added property as a favorite");
  });
});

// get all favorites
router.get('/favorites/:id', function(req, res){
	var collection = db.get('users');
	collection.findOne({email: req.params.id}, function(err, user){
		if(err) return err;
		var list1 = user.favorites_list;
		console.log(list1)
		var collection = db.get('properties');
		collection.find({_id: {$in: list1}}, function(err2, res2){
			if(err2) return err2;
			res.json(res2);
		});
	});
});

module.exports = router;
