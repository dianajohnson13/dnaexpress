var api_router = require('./../data/api_requests/api_router.js');
var searchAlgorithm = require('./searchalgorithm');
var Recommendation = require('./../data/models/recommendation');
var MailServer = require('./../mail_server/mail_server');
var User = require('./../data/models/user');

module.exports = searchControls = {

  handleSingleSearch: function (req, res) {
    var searchInput = {
      location: req.body.location,
      term: req.body.opt1
    };

    searchControls.makeRequest(searchInput, function(searchResults) {
      res.status(200).json(searchResults);
    });
  },

  makeRequest: function (searchInput, callback) {
    // used for both single search and event search
    var searchCriteria = {
      location: searchInput.location,
      searchTerm: searchInput.term
    };

    api_router.askYelp(searchCriteria, callback);
  },

  getEventRecommendations: function (userAndEventDetails, event) {
    // sample userAndEventDetails: {location:'', restrictions: [], userFoodPrefs: [], eventId: int};
    var searchInput = {};

    searchInput.location = userAndEventDetails.location;
    var searchCriteria = searchAlgorithm.parseBestOptions(userAndEventDetails.userFoodPrefs);
    var dietRestriction = getUnique(userAndEventDetails.restrictions);

    // make three calls to makeRequest with request details, (a food pref, diet restrictions, and location)
    // pass in a callback to add the result to recommendations (this will need userAndEventDetails.eventId)
    Promise.all(searchCriteria.map(function(criteria) {
      var searchInput = {
        location: userAndEventDetails.location,
        term: dietRestriction.concat(criteria[0]).join(',')  // yelp search term requires a comma seperated / stringed list
      };
      var userVotes = criteria[1];

      // for each of the three search pass in a callback that adds the top four recommendations into the recommendations table
      searchControls.makeRequest(searchInput, function(searchResults) {
        var topRecommendations = searchResults.slice(0, 4);

        topRecommendations.map(function(recommendation) {
          var newRecommendation  = {
            event_id: userAndEventDetails.eventId,
            name: recommendation.name,
            address: recommendation.location.address[0],
            city: recommendation.location.city,
            phone: recommendation.phone,
            rating_img_url: recommendation.rating_img_url,
            snippet_image_url: recommendation.snippet_image_url,
            url: recommendation.url,
            userVotes: userVotes,
            image_url: recommendation.image_url
          };
          new Recommendation(newRecommendation).save().then(function(recom) {
            //console.log('new recommendation saved!');
          })
          .catch(function(error) {
            console.log(error);
          });
        });
      })
      return 1;
    }))
    .then(function (n) {
      // email event creator to alert them to choose a restaurant
      emailCreator(event);
    }).catch(function (err){
      console.error('Failed to email Creator', err);
    });

    // helper functions:
    function getUnique() {
      var n = [];
      for (var i = 0; i < this.length; i++) {
        if (n.indexOf(this[i]) == -1) n.push(this[i]);
      }
      return n;
    };

    function emailCreator(event) {
      User
       .forge({id: event.attributes.creator})
       .fetch()
       .then(function (user) {
         return MailServer.mail(user.attributes.firstname, 'creatorAlert', user.attributes.email, event.attributes.name);
       });
    };
  }

}
