/**
 * Created by mark on 1/14/17.
 */

app.controller('AuthenticationController', function($scope, $location, $auth) {

        $scope.authenticate = function(provider) {
            $auth.authenticate(provider)
                .then(function() {
                    $location.path('/dashboard');
                })
                .catch(function(error) {

                });
        };

        $scope.submit = function() {

        };

    })

    .controller('LogoutController', function($location, $auth) {
        if (!$auth.isAuthenticated())
            return;

        $auth.logout()
            .then(function() {
                $location.path('/login');
            })
    });
