/**
 * Created by Liddy on 04-Mar-2016.
 */

app.controller('ProfessionalSearchController', function($scope, $http, $location, $auth) {

  $scope.professionals = [];

  $scope.getProfessionals = function() {
    console.log("Get Professionals");
    $http.get('http://scheduleup.crazyirish.ca/users')
      .success(function (data) {
        console.log(data);
        $scope.professionals = data;
      })
      .error(function (err) {

      });
  };

  $scope.getProfessionals();

  $scope.logout =function (){
    $auth.logout()
      .then(function () {
        $location.path('/login');
        console.log("Logout Success!");
      });
  };

});
