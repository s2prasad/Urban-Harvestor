//urban

var bcrypt = require('bcrypt-nodejs');


/* The UsersDAO must be constructed with a connected database object */
function UsersDAO(db) {
      "use strict";
    var extra={
        apikey:'AIzaSyAoFqr2K5HmDt5u7Ez7Iah9gwg1wYk56xM',
        formatter:null
    };
    // console.log("geocode");
    var geocoderProvider = 'google';
    var httpAdapter = 'http';
    var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter, extra);


    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("users");
    
    this.addUser_Receiver = function (username, password, email, companyName, address,
            city, state, zipcode, phoneNumber, company_website_address,
            daily_contact_name, daily_email_address, daily_phoneNumber,
            receiver_Hotmeals, receiver_Sackmeals, receiver_perishableGoods,
            receiver_dryGoods, receiver_accept_shopping_cart_food,drygrocery,perishablegrocery,
            re_heating_food, receiver_days_of_week, receiver_earliest_pickUpTime,
            receiver_latest_pickUpTime, receiver_refrigerator, receiver_freezer,
            receiver_pickUp_locally, receiver_message,food_recovery_type, callback) {
        "user strict";

        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);
        geocoder.geocode(address, function (err, res1) {
            if (err) {
                console.log(err);
                errors['address_error'] = " not a valid address";
                return false;
            }
            else {
                //time conversion
                var earliest_time,latest_time;
                earliest_time=receiver_earliest_pickUpTime.split(':');
                receiver_earliest_pickUpTime=parseInt(earliest_time[0])*60+parseInt(earliest_time[1]);
                latest_time = receiver_latest_pickUpTime.split(':');
                receiver_latest_pickUpTime = parseInt(latest_time[0])*60+parseInt(latest_time[1]);

        var user = {'_id': username, 'password': password_hash,
            'companyName': companyName,
            'address': {'street': address, 'city': city, 'state': state, 'zipcode': zipcode},
            'loc':{'type':"Point", 'coordinates':[res1[0].longitude, res1[0].latitude], 'index': '2d' },
            'daily_contact': {'name': daily_contact_name, 'email': daily_email_address, 'phoneNumber': daily_phoneNumber},
            'company_website_address': company_website_address,
            'food_recovery_type':food_recovery_type,
            'receiver':{'HotMeals_required': receiver_Hotmeals, 'SackMeals_required': receiver_Sackmeals,
                'perishableGoods_required': receiver_perishableGoods, 'dryGoods_required': receiver_dryGoods,
                'drygrocery':drygrocery,'perishablegrocery':perishablegrocery,
                'PreparedFood_reheating': re_heating_food, 'Max_shoppingCartFood_accept': receiver_accept_shopping_cart_food,
                'days_of_week_acceptFood':receiver_days_of_week, 'earliest_ReceivingTime':receiver_earliest_pickUpTime,
                'latest_ReceivingTime':receiver_latest_pickUpTime, 'have_refrigerator':receiver_refrigerator,
                'have_freezer':receiver_freezer, 'pickupFood_locally':receiver_pickUp_locally,
                'special_delivery_Instruction':receiver_message
            },           
                
            'phoneNumber': phoneNumber
            };
             // Add email if set
            if (email != "") {
                user['email'] = email;
            }

            users.insert(user, function (err, result) {
                "use strict";

                if (!err) {
                    console.log("Inserted new Receiver");
                    return callback(null, result[0]);
                }

                return callback(err, null);
            });//user
            }//else

        });//geocode
        }

        this.addUser_Donor = function (username, password, email, companyName, address,
                city, state, zipcode, phoneNumber, company_website_address,
                daily_contact_name, daily_email_address, daily_phoneNumber,
                donor_shopping_cart_food_daily, donor_days_of_week_foodDonation,
                donor_pickup_time, donor_require_refrigeneration, donor_require_freezer, donor_deliver_local,
                                       food_recovery_type,
                callback) {
            debugger;
            "use strict";

            // Generate password hash
            var salt = bcrypt.genSaltSync();
            var password_hash = bcrypt.hashSync(password, salt);

            geocoder.geocode(address, function (err, res1) {
                    if (err) {
                        console.log(err);
                        errors['address_error'] = " not a valid address";
                        return false;
                    }
                    else {

            // Create user document
            var user = {'_id': username, 'password': password_hash,
                'companyName': companyName,
                'address': {'street': address, 'city': city, 'state': state, 'zipcode': zipcode},
                'loc':{'type':"Point", 'coordinates':[res1[0].longitude, res1[0].latitude], 'index': '2d'
                },

                'daily_contact': {'name': daily_contact_name, 'email': daily_email_address, 'phoneNumber': daily_phoneNumber},
                'company_website_address': company_website_address,
               'food_recovery_type':food_recovery_type,
                'donor': {'shopping_cart_food_accept': donor_shopping_cart_food_daily,
                    'days_of_week_foodDonation': donor_days_of_week_foodDonation,
                    'pickup_time': donor_pickup_time,
                    'require_refrigeneration': donor_require_refrigeneration,
                    'require_freezer': donor_require_freezer,
                    'deliver_local': donor_deliver_local},
                'phoneNumber': phoneNumber
            };

            // Add email if set
            if (email != "") {
                user['email'] = email;
            }

            users.insert(user, function (err, result) {
                "use strict";

                if (!err) {
                    console.log("Inserted new Donor ");
                    return callback(null, result[0]);
                }

                return callback(err, null);
            });
                    }//else

                });//geocode
        }

        this.validateLogin = function (username, password, callback) {
            "use strict";

            // Callback to pass to MongoDB that validates a user document
            function validateUserDoc(err, user) {
                "use strict";

                if (err)
                    return callback(err, null);

                if (user) {
                    if (bcrypt.compareSync(password, user.password)) {
                        callback(null, user);
                    }
                    else {
                        var invalid_password_error = new Error("Invalid password");
                        // Set an extra field so we can distinguish this from a db error
                        invalid_password_error.invalid_password = true;
                        callback(invalid_password_error, null);
                    }
                }
                else {
                    var no_such_user_error = new Error("User: " + user + " does not exist");
                    // Set an extra field so we can distinguish this from a db error
                    no_such_user_error.no_such_user = true;
                    callback(no_such_user_error, null);
                }
            }

            users.findOne({'_id': username}, validateUserDoc);
        }
}

module.exports.UsersDAO = UsersDAO;



/*  Sample data
 *  db.users.insert({'_id': "priya11", 'password': "priya11" ,
 'companyName': "urban", 
 'address': {'street':"444 saratoga ave",'city': "santa clara", 'state': "CA", 'zipcode':"95050"},
 'phoneNumber':"11122223333"      
 })*/