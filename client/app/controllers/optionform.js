'use strict'
angular.module('app.optionform', ['app.services'])

.controller('OptionformCtrl', ['$scope', '$location', '$state', 'userFactory', 'restaurantFactory', function($scope, $location, $state, userFactory, restaurantFactory){
  $scope.search = function(data) {
    var foodtype;
    for (var key in data) {
      if (typeof data[key] === 'boolean') {
        foodtype = key;
      }
    }
    var searchParams = {
      opt1:foodtype,
      location:data.location
    }
    $state.go('dashboard.loading');
    userFactory.userReq(searchParams)
    .then(function(res){
      restaurantFactory.restaurants = res.data.slice(0, 11);
      console.log("inside restaurantFactory ",restaurantFactory.restaurants);
      $state.go('dashboard.restaurantResults');
  })
};
  $scope.getUserReq = function() {
    $state.go('dashboard.loading');

    userFactory.userReq($scope.user).then(function(res){
      restaurantFactory.restaurants = res.data.slice(0, 11);
      console.log(restaurantFactory.restaurants);
      $state.go('dashboard.restaurantResults');
    });
  }
}]);
