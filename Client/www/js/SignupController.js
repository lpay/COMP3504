/**
 * Created by Liddy on 12-Feb-2016.
 */

app.controller('SignupController', function($scope, $http, $auth, $location) {
/*
  $scope.signup = function() {

    $http.post('http://localhost:3504/auth/signup', { name: $scope.name, email: $scope.email, password: $scope.password, password2: $scope.password2})
      .success(function(data) {
        console.log(data);
      })
      .error(function(err){
        console.log(err);
      });

  }
*/

  $scope.signup = function() {
    $auth.signup($scope.register)
      .then(function(token) {
        $auth.setToken(token);
        $location.path("/login");
        console.log("Registration Success!");
      })
      .catch(function(res) {
        //$("#signup").effect('shake');
        console.log("Registration FAIL!");
      });
  };

});
