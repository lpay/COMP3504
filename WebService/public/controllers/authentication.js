/**
 * Created by mark on 1/14/17.
 */

(function() {
    'use strict';

    angular
        .module('app')
        .controller('AuthenticationController', AuthenticationController)
        .controller('LogoutController', LogoutController);


    function AuthenticationController($auth, $scope, $state) {
        $scope.showLogin = true;

        $scope.authenticate = function(provider) {
            $auth.authenticate(provider)
                .then(function() {
                    $state.go('dashboard.scheduler');
                })
                .catch(function(res) {
                    console.log(res);
                });
        };

        $scope.login = function() {
            $auth.login($scope.user)
                .then(function() {
                    $state.go('dashboard.scheduler');
                })
                .catch(function() {
                    $("#login").effect('shake');
                });
        };

        $scope.signup = function() {
            $auth.signup($scope.register)
                .then(function(token) {
                    $auth.setToken(token);
                    $state.go('join');
                })
                .catch(function() {
                    $("#signup").effect('shake');
                });
        };
    }

    function LogoutController($auth, $state) {
        if (!$auth.isAuthenticated())
            $state.go('login');

        $auth.logout()
            .then(function() {
                $state.go('login');
            });
    }

})();
