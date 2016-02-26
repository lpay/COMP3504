/**
 * Created by Liddy on 19-Feb-2016.
 */

app.controller("HomeController", function($scope, $http, $location, $auth) {

  $scope.searchBar = function() {


  };

  $scope.logout =function (){
    $auth.logout()
      .then(function () {
        $location.path('/login');
        console.log("Logout Success!");
      });
  };


});
