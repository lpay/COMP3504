/**
 * Created by Liddy on 12-Feb-2016.
 */

app.controller('SignupController', function($scope, $http, $auth, $location) {
/*
  $scope.signup = function() {

    $http.post('http://localhost:3504/auth/signup', { firstName: $scope.firstName, email: $scope.email, password1: $scope.password1, password2: $scope.password2})
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
        console.log("Register Success!");
        $auth.setToken(token);
        $location.path('/join');
      })
      .catch(function(res) {
        console.log("Register Fail!");
        //$("#signup").effect('shake');
      });
  };

});
