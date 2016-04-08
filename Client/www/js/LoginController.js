/**
 * Created by Liddy on 10-Feb-2016.
 */

(function() {
    angular
        .module('app')
        .controller('LoginController', LoginController)
        .controller('LogoutController', LogoutController);

    function LoginController($auth, $scope, $state) {
        $scope.login = function() {
            $auth.login($scope.auth)
                .then(function () {
                    $state.go('app.home');
                })
                .catch(function (res) {
                    // TODO: login failed message
                });
        };

        $scope.authenticate = function(provider) {
            $auth.authenticate(provider)
                .then(function() {
                    $state.go('app.home');
                })
                .catch(function(res) {
                    // TODO: login failed message
                });
        };
    }

    function LogoutController($auth, $state) {
        $auth.logout();
        $state.go('login');
    }
})();