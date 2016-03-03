/**
 * Created by mark on 1/14/17.
 */

app.controller('AuthenticationController', function($scope, $location, $auth) {

        $scope.showLogin = true;

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
                .catch(function() {
                    $("#login").effect('shake');
                });
        };

        $scope.signup = function() {
            $auth.signup($scope.register)
                .then(function(token) {
                    $auth.setToken(token);
                    $location.path('/join');
                })
                .catch(function() {
                    $("#signup").effect('shake');
                });
        };

    })

    .controller('LogoutController', function($location, $auth) {
        if (!$auth.isAuthenticated())
            $location.path('/login');

        $auth.logout()
            .then(function() {
                $location.path('/login');
            });
    });
