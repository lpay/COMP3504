/**
 * Created by Liddy on 12-Feb-2016.
 */

(function() {
    angular
        .module('app')
        .controller('SignupController', SignupController);


    function SignupController($auth, $scope, $state) {

        $scope.register = {};

        $scope.signup = function () {
            $auth.signup($scope.register)
                .then(function (token) {
                    $auth.setToken(token);
                    $state.go('login');
                })
                .catch(function(res) {
                    // TODO: Visual Error Message
                });
        };
    }
})();