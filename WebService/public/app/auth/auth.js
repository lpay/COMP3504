/**
 * Created by mark on 1/14/17.
 */

app.controller('AuthenticationController', function($scope, $location, $auth) {

        $scope.authenticate = function(provider) {
            $auth.authenticate(provider)
                .then(function() {
                    $location.path('/dashboard');
                })
                .catch(function(res) {
                    console.log(res);
                });
        };

        $scope.login = function() {
            $auth.login($scope.user)
                .then(function() {
                    $location.path('/dashboard');
                })
                .catch(function(res) {
                    console.log(res);
                });
        };

        $scope.signup = function() {
            $auth.signup($scope.register)
                .then(function(token) {
                    $auth.setToken(token);
                    $location.path('/join');
                })
                .catch(function(res) {
                    console.log(res);
                });
        }

    })

    .controller('LogoutController', function($location, $auth) {
        if ($auth.isAuthenticated()) {
            $auth.logout()
                .then(function() {
                    $location.path('/login');
                })
        } else {
            $location.path('/login');
        }
    });
