/**
 * Created by Liddy on 10-Feb-2016.
 */

app.controller('LoginController', function($scope, $http) {

    /*$scope.signup = function() {

      $http.post('http://localhost:3504/auth/signup', { email: $scope.email, password: $scope.password})
        .success(function(data) {
          console.log(data);
        })
        .error(function(err){
          console.log(err);
        });

    }*/

  $scope.signin = function() {

      $http.post('http://localhost:3504/auth/login', { email: $scope.email, password: $scope.password})
        .success(function(data) {
          console.log(data);

        })
        .error(function(err){
          console.log(err);
        });

    }
});
