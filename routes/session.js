//urban harvester

var UsersDAO = require('../users').UsersDAO
        , SessionsDAO = require('../sessions').SessionsDAO;

/*var addressValidator = require('address-validator');
var Address = addressValidator.Address;
var _ = require('underscore');*/
    var mongojs = require('mongojs');


var db2=mongojs('urban',['inventory']);
/* The SessionHandler must be constructed with a connected db */
function SessionHandler(db) {
    "use strict";

    var users = new UsersDAO(db);
    var sessions = new SessionsDAO(db);

    this.isLoggedInMiddleware = function (req, res, next) {
        var session_id = req.cookies.session;
        sessions.getUsername(session_id, function (err, username) {
            "use strict";

            if (!err && username) {
                req.username = username;
            }
            return next();
        });
    }

    this.displayLoginPage = function (req, res, next) {
        "use strict";
        return res.render("login", {username: "", password: "", login_error: ""})
    }
//Inventory
    
    this.handleInsertInventoryItem=function(req, res, next){
        console.log("Inside handleInsertInventoryItem");
       
       console.log(req.username);
        
        req.body['userId'] =req.username;
          
  db2.inventory.insert(req.body, function(err, doc) {
    res.json(doc);
  });
    }
      this.handleGetInventoryItem=function(req, res, next){
        console.log("Inside handleGetInventoryItem");
           console.log(req.username);
  db2.inventory.find({ userId: req.username } ,function (err, docs) {
    console.log(docs);
    res.json(docs);
  });
    }
  
  this.handleGetSingleInventoryItem=function(req, res, next){
        console.log("Inside handleGetSingleInventoryItem");
        var id = req.params.id;
  console.log(id);
  db2.inventory.findOne({_id: mongojs.ObjectId(id)}, function (err, doc) {
    res.json(doc);
  });
          
    };

    this.handleDeleteSingleInventoryItem=function(req, res, next){
        console.log("Inside handleDeleteSingleInventoryItem");
        var id = req.params.id;
        console.log(id);
        db2.inventory.remove({_id: mongojs.ObjectId(id)}, function (err, doc) {
             res.json(doc);
        });  
    };

    this.handleUpdateSingleInventoryItem=function(req, res, next){
        var id = req.params.id;
        console.log("ID!! "+id);
        db2.inventory.findAndModify({
            query: {_id: mongojs.ObjectId(id)},
            update: {$set: {id: req.body.id, name: req.body.name, wt: req.body.wt, servings: req.body.servings, retail: req.body.retail}},
            new: true}, function (err, doc) {
            res.json(doc);
        }
      );
    };
    
    this.handleLoginRequest = function (req, res, next) {
        "use strict";

        var username = req.body.username;
        var password = req.body.password;

        console.log("user submitted username: " + username + " pass: " + password);

        users.validateLogin(username, password, function (err, user) {
            "use strict";

            if (err) {
                if (err.no_such_user) {
                    return res.render("login", {username: username, password: "", login_error: "No such user"});
                }
                else if (err.invalid_password) {
                    return res.render("login", {username: username, password: "", login_error: "Invalid password"});
                }
                else {
                    // Some other kind of error
                    return next(err);
                }
            }

            sessions.startSession(user['_id'], function (err, session_id) {
                "use strict";

                if (err)
                    return next(err);

                res.cookie('session', session_id);
                return res.redirect('/main');
            });
        });
    }

    this.displayLogoutPage = function (req, res, next) {
        "use strict";

        var session_id = req.cookies.session;
        sessions.endSession(session_id, function (err) {
            "use strict";

            // Even if the user wasn't logged in, redirect to home
            res.cookie('session', '');
            return res.redirect('/');
        });
    }

    this.displaySignupPage = function (req, res, next) {
        "use strict";
        res.render("signup", {username: "", password: "",password_error: "", email: "",
            username_error: "", email_error: "", verify_error: "", companyName_error: "",
            city_error: "", state_error: "",zipcode_error: "", phoneNumber_error: "",
            company_website_address_error: "",companyName:"", address:"",address_error:"",
            city:"", state:"", zipcode:"", phoneNumber:"", company_website_address:"",

            daily_contact_name:"", daily_email_address:"", daily_phoneNumber:"",
            daily_contactName_error: "",daily_email_address_error: "",daily_phoneNumber_error: "",

            donor_shopping_cart_food_daily:"", donor_days_of_week_foodDonation:"",
            donor_pickup_time:"", donor_require_refrigeneration:"", donor_require_freezer:"", donor_deliver_local:"",
            food_recovery_type:"",
            donor_shoppingcart_error: "", donor_days_of_week_error: "", donor_pickup_time_error: "",
            donor_require_refrigeneration_error: "", donor_require_freezer_error: "",donor_deliver_local_error: "",

            receiver_Hotmeals:"", receiver_Sackmeals:"", receiver_perishableGoods:"",
            receiver_dryGoods:"", receiver_accept_shopping_cart_food:"",re_heating_food:"",
            receiver_days_of_week:"", receiver_earliest_pickUpTime:"",
            receiver_latest_pickUpTime:"", receiver_refrigerator:"",
            receiver_freezer:"",receiver_pickUp_locally:"",

            receiver_hot_meals_error: "",receiver_sack_meals_error: "",receiver_bags_perishables_error: "",
            receiver_bags_dryGoods_error: "",receiver_shopping_cart_error: "",
                    
                  
        });
    }
    function validateReceiver(receiver_Hotmeals, receiver_Sackmeals, receiver_perishableGoods,
            receiver_dryGoods, receiver_accept_shopping_cart_food, errors) {
       var FOODCART_RE = /^[0-9]{1,2}$/;
        debugger;
        errors['receiver_hot_meals_error'] = "";
        errors['receiver_sack_meals_error'] = "";
        errors['receiver_bags_perishables_error'] = "";
        errors['receiver_bags_dryGoods_error'] = "";
        errors['receiver_shopping_cart_error'] = "";

        if (!FOODCART_RE.test(receiver_Hotmeals)) {
            errors['receiver_hot_meals_error'] = "Numeric values only";
            return false;
        }
        if (!FOODCART_RE.test(receiver_Sackmeals)) {
            errors['receiver_sack_meals_error'] = "Numeric values only";
            return false;
        }
        if (!FOODCART_RE.test(receiver_perishableGoods)) {
            errors['receiver_bags_perishables_error'] = "Numeric values only";
            return false;
        }
        if (!FOODCART_RE.test(receiver_dryGoods)) {
            errors['receiver_bags_dryGoods_error'] = "Numeric values only";
            return false;
        }
        if (!FOODCART_RE.test(receiver_accept_shopping_cart_food)) {
            errors['receiver_shopping_cart_error'] = "Numeric values only";
            return false;
        }
        //radio buttons
        return true;

    }
    function validateDonor(donor_shopping_cart_food_daily, donor_days_of_week_foodDonation,
            donor_pickup_time, donor_require_refrigeneration,
            donor_require_freezer, donor_deliver_local, errors) {
        errors['donor_shoppingcart_error'] = "";
         errors['donor_days_of_week_error'] = "";
         errors['donor_pickup_time_error'] = "";
         errors['donor_require_refrigeneration_error'] = "";
         errors['donor_require_freezer_error'] = "";
         errors['donor_deliver_local_error'] = "";
        debugger;
        var FOODCART_RE = /^[0-9]{1,2}$/;
        if (donor_shopping_cart_food_daily != "") {
            if (!FOODCART_RE.test(donor_shopping_cart_food_daily)) {
                errors['donor_shoppingcart_error'] = "Numeric values only";
                return false;
            }
        }else{
            errors['donor_shoppingcart_error'] = "cannot be null";
            return false;
        }
         if (donor_days_of_week_foodDonation == "") {
         errors['donor_days_of_week_error'] = "cannot be null";
         return false;
         }
         if (donor_pickup_time == "") {
         errors['donor_pickup_time_error'] = "cannot be null";
         return false;
         }
         if (donor_require_refrigeneration == "") {
         errors['donor_require_refrigeneration_error'] = "cannot be null";
         return false;
         }
         if (donor_require_freezer == "") {
         errors['donor_require_freezer_error'] = "cannot be null";
         return false;
         }
         if (donor_deliver_local == "") {
         errors['donor_deliver_local_error'] = "cannot be null";
         return false;
         }
        return true;
    }
    function validateSignup(username, password, verify, email, companyName, address,
            city, state, zipcode, phoneNumber, company_website_address, daily_contact_name,
            daily_email_address, daily_phoneNumber, errors) {
        "use strict";
        var USER_RE = /^[a-zA-Z0-9_-]{3,20}$/;
        var PASS_RE = /^.{3,20}$/;
        var EMAIL_RE = /^[\S]+@[\S]+\.[\S]+$/;
     //   debugger;
        var LETTERS_RE =/^([A-Za-z]+ )+[A-Za-z]+$|^[A-Za-z]+$/;
        var ZIPCODE_RE = /^[0-9]{5}([- ]?[0-9]{4})?$/;
        var PHONE_RE = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        //address -geolocation
        errors['username_error'] = "";
        errors['password_error'] = "";
        errors['verify_error'] = "";
        errors['email_error'] = "";

        errors['companyName_error'] = "";
        errors['city_error'] = "";
        errors['state_error'] = "";
        errors['zipcode_error'] = "";
        errors['phoneNumber_error'] = "";

        errors['company_website_address_error'] = "";
        //2 *
        errors['daily_contactName_error'] = "";
        errors['daily_email_address_error'] = "";
        errors['daily_phoneNumber_error'] = "";
        errors['address_error']="";

        if (!USER_RE.test(username)) {
            errors['username_error'] = "invalid username. try just letters and numbers";
            return false;
        }
        if (!PASS_RE.test(password)) {
            errors['password_error'] = "invalid password.";
            return false;
        }
        if (password != verify) {
            errors['verify_error'] = "password must match";
            return false;
        }
        if (email != "") {
            if (!EMAIL_RE.test(email)) {
                errors['email_error'] = "invalid email address";
                return false;
            }
        }

        if (companyName != "") {
            if (!LETTERS_RE.test(companyName)) {
                errors['companyName_error'] = "invalid company Name";
                return false;
            }
        }
        if (city != "") {
            if (!LETTERS_RE.test(city)) {
                errors['city_error'] = "invalid name for city";
                return false;
            }
        }
        if (state != "") {
            if (!LETTERS_RE.test(state)) {
                errors['state_error'] = "invalid name for  state";
                return false;
            }
        }
        if (zipcode != "") {
            if (!ZIPCODE_RE.test(zipcode)) {
                errors['zipcode_error'] = "invalid Zipocde";
                return false;
            }
        }
        if (phoneNumber != "") {
            if (!PHONE_RE.test(phoneNumber)) {
                errors['phoneNumber_error'] = "invalid phone number";
                return false;
            }
        }
        //-----------------------  2*  --------------------------
        if (company_website_address != "") {
            if (!EMAIL_RE.test(company_website_address)) {
                errors['company_website_address_error'] = "invalid company website address";
                return false;
            }
        }
        // ------------------------- 3* -----------------------------------
        if (daily_contact_name != "") {
            if (!LETTERS_RE.test(daily_contact_name)) {
                errors['daily_contactName_error'] = "invalid contact name";
                return false;
            }
        }
        if (daily_email_address != "") {
            if (!EMAIL_RE.test(daily_email_address)) {
                errors['daily_email_address_error'] = "invalid email address";
                return false;
            }
        }
        if (daily_phoneNumber != "") {
            if (!PHONE_RE.test(daily_phoneNumber)) {
                errors['daily_phoneNumber_error'] = "invalid phone number";
                return false;
            }
        }

        return true;
    }

    this.handleSignup = function (req, res, next) {
        "use strict";
        //1.*
        var email = req.body.email
        var username = req.body.username
        var password = req.body.password
        var verify = req.body.verify

        var companyName = req.body.company_name;
        var address = req.body.address;
        var city = req.body.city;
        var state = req.body.state;
        var zipcode = req.body.zipcode;
        var phoneNumber = req.body.phone_number;
        //2*
        var company_website_address = req.body.company_website;
        //3*
        var daily_contact_name = req.body.daily_contact_name;
        var daily_email_address = req.body.daily_email;
        var daily_phoneNumber = req.body.daily_phone_number;
        //4*
        var food_recovery_type = req.body.foodRecovery_type;//Donor or Receiver or Transpoter
        var flag = false;
        var coords ="";

        //Donor
        var donor_shopping_cart_food_daily = "", donor_days_of_week_foodDonation = "",
                donor_require_refrigeneration = "", donor_pickup_time = "",
                donor_require_freezer = "", donor_deliver_local = "";

        //Receiver
        var receiver_Hotmeals = "", receiver_Sackmeals = "", receiver_perishableGoods = "",
                receiver_dryGoods = ""; //re_heating_food ="", receiver_accept_shopping_cart_food =""

        // set these up in case we have an error case
        //change
        var errors = {'username': username, 'email': email,'password':password, 'verify':verify,'companyName':companyName,
                      'address':address,
                'city':city, 'state':state, 'zipcode':zipcode, 'phoneNumber':phoneNumber, 'company_website_address':company_website_address,
                'daily_contact_name':daily_contact_name, 'daily_email_address':daily_email_address, 'daily_phoneNumber':daily_phoneNumber
                      
                     }

         if (validateSignup(username, password, verify, email, companyName, address,
                city, state, zipcode, phoneNumber, company_website_address,
                daily_contact_name, daily_email_address, daily_phoneNumber,
                errors)) {
             //ge0code


             if (address != "") {
                 address = address.concat(" ", city, " ", state);

             }//address
             else{
                 errors['address_error']="address errro";
             }
            switch (food_recovery_type) {
                case 'Donor':
                    donor_shopping_cart_food_daily = req.body.donor_shopping_cart;
                    donor_days_of_week_foodDonation = req.body.days_of_week;
                    donor_pickup_time = req.body.pickup_time;
                    donor_require_refrigeneration = req.body.refrigeration;
                    donor_require_freezer = req.body.freezer;
                    donor_deliver_local = req.body.deliver_local;

                    if (validateDonor(donor_shopping_cart_food_daily, donor_days_of_week_foodDonation,
                            donor_pickup_time, donor_require_refrigeneration, donor_require_freezer,
                            donor_deliver_local, errors)) {
                        flag = true;

                        users.addUser_Donor(username, password, email, companyName, address,
                            city, state, zipcode, phoneNumber, company_website_address,
                            daily_contact_name, daily_email_address, daily_phoneNumber,
                            donor_shopping_cart_food_daily, donor_days_of_week_foodDonation,
                            donor_pickup_time, donor_require_refrigeneration, donor_require_freezer, donor_deliver_local,
                            food_recovery_type,
                            function (err, user) {
                                "use strict";

                                if (err) {
                                    // this was a duplicate
                                    if (err.code == '11000') {
                                        errors['username_error'] = "Username already in use. Please choose another";
                                        return res.render("signup", errors);
                                    }
                                    // this was a different error
                                    else {
                                        return next(err);
                                    }
                                }

                                sessions.startSession(user['_id'], function (err, session_id) {
                                    "use strict";

                                    if (err)
                                        return next(err);

                                    res.cookie('session', session_id);
                                    return res.redirect('/main');
                                });
                            });

                    }
                    else
                        flag = false;
                    break;
                case 'Receiver'://debugger;
                    receiver_Hotmeals = req.body.hot_meals;
                    receiver_Sackmeals = req.body.sack_meals;
                    receiver_perishableGoods = req.body.bags_perishables;
                    receiver_dryGoods = req.body.bags_dryGoods;
                    var re_heating_food = req.body.reheating;
                    var drygrocery = req.body.drygrocery;
                    var perishablegrocery = req.body.perishablegrocery;
                    var receiver_accept_shopping_cart_food = req.body.receiver_shopping_carts;
                    var receiver_days_of_week = req.body.receiver_days_of_week;
                    var receiver_earliest_pickUpTime = req.body.receiver_earliest_pickUpTime;
                    var receiver_latest_pickUpTime = req.body.receiver_latest_pickUpTime;
                    var receiver_refrigerator = req.body.receiver_refrigerator;
                    var receiver_freezer = req.body.receiver_freezer;
                    var receiver_pickUp_locally = req.body.receiver_pickUp_locally;
                    var receiver_message = "No message";
                    receiver_message = req.body.receiver_specialRequest_message;

                    if (validateReceiver(receiver_Hotmeals, receiver_Sackmeals, receiver_perishableGoods,
                            receiver_dryGoods, receiver_accept_shopping_cart_food, errors)) {
                        flag = true;
                        users.addUser_Receiver(username, password, email, companyName, address,
                                city, state, zipcode, phoneNumber, company_website_address,
                                daily_contact_name, daily_email_address, daily_phoneNumber,
                                receiver_Hotmeals, receiver_Sackmeals, receiver_perishableGoods,
                                receiver_dryGoods, receiver_accept_shopping_cart_food,drygrocery,perishablegrocery,
                                re_heating_food, receiver_days_of_week, receiver_earliest_pickUpTime,
                                receiver_latest_pickUpTime, receiver_refrigerator, receiver_freezer,
                                receiver_pickUp_locally, receiver_message,food_recovery_type, function (err, user) {
                                    "use strict";

                                    if (err) {
                                        // this was a duplicate
                                        if (err.code == '11000') {
                                            errors['username_error'] = "Username already in use. Please choose another";
                                            return res.render("signup", errors);
                                        }
                                        // this was a different error
                                        else {
                                            return next(err);
                                        }
                                    }

                                    sessions.startSession(user['_id'], function (err, session_id) {
                                        "use strict";

                                        if (err)
                                            return next(err);

                                        res.cookie('session', session_id);
                                        return res.redirect('/main');
                                    });
                                });

                    }
                    else
                        flag = false;
                    break;
                case 'Transporter'://if(validateTransporter()){return true;} else return false;
                    break;
                default:
                    flag = false;
                    break;
            }//switch
                 //geo
        }//if validate
        else {
            console.log("user did not validate");
            return res.render("signup", errors);
        }
        if (flag == false) {
            console.log("donor/receiver/transporter did not validate");
            return res.render("signup", errors);
        }
    }

    this.displayWelcomePage = function (req, res, next) {
        "use strict";

        if (!req.username) {
            console.log("welcome: can't identify user...redirecting to signup");
            return res.redirect("/signup");
        }

        return res.render("main", {'username': req.username})
    }
}

module.exports = SessionHandler;
