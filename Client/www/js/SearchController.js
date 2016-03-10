/**
 * Created by Johnny Admin on 2/29/2016.
 */

app.controller('SearchController', function($scope, $http, $location, $auth, $ionicSideMenuDelegate, $ionicLoading) {

  $scope.names = [];

  $scope.doSearch = function() {
    $scope.show($ionicLoading);
    console.log('search');
    $http.get('http://localhost:3504/events/' + encodeURIComponent($scope.search))
      .success(function (data) {
        console.log(data);
        $scope.names = data;
      })
      .error(function (err) {

      })
    .finally(function ($ionicLoading) {
      // On both cases hide the loading
      $scope.hide($ionicLoading);
    });
  };

  $scope.goToGroupSearch = function(){
    $location.path("/groups");
    console.log("Redirect Success!");
  };

  $scope.goToProfessionalSearch = function(){
    $location.path("/users");
    console.log("Redirect Success!");
  };


  $scope.goToHome = function(){
    $location.path("/");
    console.log("Redirect Success!");
  };

  $scope.show = function() {
    $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
    });
  };

  $scope.hide = function() {
    $ionicLoading.hide();
  };

  $scope.toggleLeft  = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.clearSearch = function() {
    $scope.$parent.search = '';
    $scope.names=[];
    console.log("Clear Search");
  };

  $scope.toggleRight = function() {
    $ionicSideMenuDelegate.toggleRight();
  };

  $scope.logout = function (){
    $auth.logout()
      .then(function () {
        $location.path('/login');
        console.log("Logout Success!");
      });
  };

});

