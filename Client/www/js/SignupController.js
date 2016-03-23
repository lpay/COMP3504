/**
 * Created by Liddy on 12-Feb-2016.
 */

app.controller('SignupController', function($auth, $scope, $state) {

    $scope.register = {};

    $scope.signup = function() {
        $auth.signup($scope.register)
            .then(function(token) {
                $auth.setToken(token);
                $state.go('dashboard.home');
            })
            .catch(function(res) {
                console.log(res);
            });
    };

});
