/**
 * Created by Johnny Admin on 2/29/2016.
 */

app.controller('HomeController', function($scope, $http, $location, $auth) {

  $scope.names = [];

  $scope.doSearch = function() {
    console.log('search');
    $http.get('http://localhost:3504/events/' + encodeURIComponent($scope.search))
      .success(function (data) {
        console.log(data);
        $scope.names = data;
      })
      .error(function (err) {

      });
  };

  $scope.logout =function (){
    $auth.logout()
      .then(function () {
        $location.path('/login');
        console.log("Logout Success!");
      });
  };
});
