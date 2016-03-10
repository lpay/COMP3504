/**
 * Created by Liddy on 10-Feb-2016.
 */

app

    .controller('LoginController', function($auth, $scope, $state) {

        $scope.login = function() {
            $auth.login($scope.auth)
                .then(function () {
                    $state.go('dashboard.home');
                })
                .catch(function (res) {

                });
        };

        $scope.authenticate = function(provider) {
            $auth.authenticate(provider)
                .then(function() {
                    $state.go('dashboard.home');
                })
                .catch(function(res) {

                });
        };

        $scope.goToSignup = function(){
            $state.go('signup');
        }

    })

    .controller('LogoutController', function($auth, $state) {
        $auth.logout();
        $state.go('login');
    });
