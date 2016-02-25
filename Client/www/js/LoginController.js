/**
 * Created by Liddy on 10-Feb-2016.
 */

app.controller('LoginController', function($scope, $http, $auth) {
/*
  $scope.signin = function() {

      $http.post('http://localhost:3504/auth/login', { email: $scope.email, password: $scope.password})
        .success(function(data) {
          console.log(data);


        })
        .error(function(err){
          console.log(err);
        });

    }
*/
  $scope.login = function() {
    $auth.login($scope.user)
      .then(function () {
        $location.path('/dashboard');
      })
      .catch(function (res) {
        $("#login").effect('shake');
      });
  };

});
