'use strict'
angular.module('app.auth', ['app.services', 'app.eventfactory'])

.controller('AuthCtrl', ['$scope', '$state', '$window', 'Auth', 'Profile', 'eventFactory',function($scope, $state, $window, Auth, Profile, eventFactory){
  $scope.reset = function(form) {
    if (form) {
      form.$setPristine();
      form.$setUntouched();
    }
  }
  $scope.signin = function () {
    var isValid = validateSignup($scope.user);
    if (isValid) {
    Auth.signin($scope.user)
      .then(function (response) {
        if (response.data.token) {
          $window.localStorage.setItem('com.app', response.data.token);
          $state.go('dashboard.showevent');
        }
        else {
          alert("email / password not recognized")
          $scope.reset();
          $state.go('main.signin');
        }
      })
      .catch(function (error) {
        console.error(error);
      });
    }
    else {
      alert("Please use only letters and numbers. Emails should contain an '@' and a '.'");
    }
  };

  $scope.advanceToFoodPrefs = function() {
    $state.go('main.createprofile', {user:$scope.user})
  };

  $scope.signup = function () {
    var data = Profile.processData($scope.user);
    var isValid = validateSignup($scope.user);
    if (isValid) {

    Auth.signup(data)
      .then(function (token) {
        $window.localStorage.setItem('com.app', token);
        $state.go('dashboard.createprofile', {user:$scope.user});
      })
      .catch(function (error) {
        console.error(error);
      });

    }
    else {
      alert("Please use only letters and numbers in username, name, and password fields. Emails should contain an '@' and a '.'");
    }
  };

  function validateSignup(data) {
    console.log(data);
    var isValid = true;
    for(var field in data) {
      var string = data[field];
      if (field !== "email" && field !== "location") {
        var n = data[field].search(/\W/g);
        if (n > -1) {
          isValid = false;
        }
      }
    }
    return isValid;
  };

}])
