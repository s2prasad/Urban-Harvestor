var PostsDAO = require('../posts').PostsDAO
  , sanitize = require('validator').sanitize; // Helper to sanitize form input
var UsersDAO = require('../users').UsersDAO
    , SessionsDAO = require('../sessions').SessionsDAO;
    
    var mongojs = require('mongojs');


var db2=mongojs('urban',['users']);
/* The ContentHandler must be constructed with a connected db */
function ContentHandler (db) {
    "use strict";

    var posts = new PostsDAO(db);

    this.displayMainPage = function(req, res, next) {
        "use strict";

        posts.getPosts(10, function(err, results) {
            "use strict";

            if (err) return next(err);

             return res.render('index');
        });
    }

    this.displayMainPageByTag = function(req, res, next) {
        "use strict";

        var tag = req.params.tag;

        posts.getPostsByTag(tag, 10, function(err, results) {
            "use strict";

            if (err) return next(err);

            return res.render('blog_template', {
                title: 'blog homepage',
                username: req.username,
                myposts: results
            });
        });
    }

    this.displayPostByPermalink = function(req, res, next) {
        "use strict";

        var permalink = req.params.permalink;

        posts.getPostByPermalink(permalink, function(err, post) {
            "use strict";

            if (err) return next(err);

            if (!post) return res.redirect("/post_not_found");

            // init comment form fields for additional comment
            var comment = {'name': req.username, 'body': "", 'email': ""}

            return res.render('entry_template', {
                title: 'blog post',
                username: req.username,
                post: post,
                comment: comment,
                errors: ""
            });
        });
    }

    this.handleNewComment = function(req, res, next) {
        "use strict";
        var name = req.body.commentName;
        var email = req.body.commentEmail;
        var body = req.body.commentBody;
        var permalink = req.body.permalink;

        // Override the comment with our actual user name if found
        if (req.username) {
            name = req.username;
        }

        if (!name || !body) {
            // user did not fill in enough information

            posts.getPostByPermalink(permalink, function(err, post) {
                "use strict";

                if (err) return next(err);

                if (!post) return res.redirect("/post_not_found");

                // init comment form fields for additional comment
                var comment = {'name': name, 'body': "", 'email': ""}

                var errors = "Post must contain your name and an actual comment."
                return res.render('entry_template', {
                    title: 'blog post',
                    username: req.username,
                    post: post,
                    comment: comment,
                    errors: errors
                });
            });

            return;
        }

        // even if there is no logged in user, we can still post a comment
        posts.addComment(permalink, name, email, body, function(err, updated) {
            "use strict";

            if (err) return next(err);

            if (updated == 0) return res.redirect("/post_not_found");

            return res.redirect("/post/" + permalink);
        });
    }

    this.displayPostNotFound = function(req, res, next) {
        "use strict";
        return res.send('Sorry, post not found', 404);
    }

    this.displayNewPostPage = function(req, res, next) {
        "use strict";

        if (!req.username) return res.redirect("/login");

        return res.render('newpost_template', {
            subject: "",
            body: "",
            errors: "",
            tags: "",
            username: req.username
        });
    }

    function extract_tags(tags) {
        "use strict";

        var cleaned = [];

        var tags_array = tags.split(',');

        for (var i = 0; i < tags_array.length; i++) {
            if ((cleaned.indexOf(tags_array[i]) == -1) && tags_array[i] != "") {
                cleaned.push(tags_array[i].replace(/\s/g,''));
            }
        }

        return cleaned
    }

    this.handleNewPost = function(req, res, next) {
        "use strict";

        var title = req.body.subject
        var post = req.body.body
        var tags = req.body.tags

        if (!req.username) return res.redirect("/signup");

        if (!title || !post) {
            var errors = "Post must contain a title and blog entry";
            return res.render("newpost_template", {subject:title, username:req.username, body:post, tags:tags, errors:errors});
        }

        var tags_array = extract_tags(tags)

        // looks like a good entry, insert it escaped
        var escaped_post = sanitize(post).escape();

        // substitute some <br> for the paragraph breaks
        var formatted_post = escaped_post.replace(/\r?\n/g,'<br>');

        posts.insertEntry(title, formatted_post, tags_array, req.username, function(err, permalink) {
            "use strict";

            if (err) return next(err);

            // now redirect to the blog permalink
            return res.redirect("/post/" + permalink)
        });
    }
    this.handleDonateRequest = function(req, res, next) {
    
        var users = db.collection("users");
var givendaate=req.body.donationdate;
  var giventime= req.body.time;
  
 //code to convert AM/PM 12hr time to 24hr format
  var time = giventime;
var hours = Number(time.match(/^(\d+)/)[1]);
var minutes = Number(time.match(/:(\d+)/)[1]);
var AMPM = time.match(/\s(.*)$/)[1];
if(AMPM == "PM" && hours<12) hours = hours+12;
if(AMPM == "AM" && hours==12) hours = hours-12;
var sHours = hours.toString();
var sMinutes = minutes.toString();
if(hours<10) sHours = "0" + sHours;
if(minutes<10) sMinutes = "0" + sMinutes;
console.log(sHours + ":" + sMinutes);
  console.log(givendaate);
        var perishable= req.body.perishable;
  var times= giventime.split(':');
        var date = new Date(req.body.donationdate);
      console.log("**"+date);
        var todays_day = ""+date.getDay();
        var currentMinutes=parseInt(sHours)*60+parseInt(sMinutes);
var coord;
 users.findOne({'_id': req.username}, validateId);
   function validateId(err, response1) {
                "use strict";

                if (err)
                    return callback(err, null);
                    else{
                coord=response1.loc.coordinates;
                console.log("hi"+coord);
                console.log(coord[0]);
                console.log(coord[1]);
                  
db2.runCommand(
   {
     geoNear: "users",
     near: { type: "Point", coordinates:[ coord[0],coord[1]] },
     spherical: true,
     distanceMultiplier:  0.001,
      maxDistance: 70000,
     query: { "food_recovery_type" : "Receiver","receiver.days_of_week_acceptFood":todays_day,"receiver.earliest_ReceivingTime": { $lte: currentMinutes } , "receiver.latest_ReceivingTime": { $gte: currentMinutes }
     }},function(err,docs){
     if(err){
      console.log(err);
     }else{
   console.log(docs.results);
    return res.render("main", {'results': docs.results})
   }
   }
);
  }
  
                    }
    }
}

module.exports = ContentHandler;
/*

 db.runCommand(
 {
 geoNear: "users",
 near: { type: "Point", coordinates: [-121.962869, 37.335895] },
 spherical: true,
 query: { }
 }
 )
 */