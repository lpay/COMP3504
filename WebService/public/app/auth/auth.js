/**
 * Created by mark on 1/14/17.
 */

app.controller('AuthenticationController', function($scope, $http) {

    /**
     * login
     */
    $scope.login = function () {
        /*
        console.log($scope.username);
        console.log($scope.password);
        */

        $http.post('/api/auth/login', { email: $scope.username, password: $scope.password })

            .success(function(res) {

            })

            .error(function(res) {

            });
    };

    /**
     * google oauth2
     */
    $scope.google = function() {
        console.log('google');
    };

    /**
     * facebook oauth2
     */
    $scope.facebook = function() {
        console.log('facebook');
    };

    /**
     * register
     */
    $scope.register = function () {
        console.log($scope);
    };

    /**
     * logout
     */
    $scope.logout = function () {
        console.log('logout!');
    };

});

app.directive('emailValidator', function(AuthenticationService) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ngModel) {
            ngModel.$asyncValidators.unique = AuthenticationService.isValidEmail;
        }
    }
});

app.service('AuthenticationService', function($q, $http) {
    return {
        isValidEmail: function(email) {
            var deferred = $q.defer();

            $http.post('/api/users', { email: email })


                .success(function(res) {

                    switch(res.status) {
                        case "success":
                            deferred.resolve();
                            break;

                        case "error":

                            deferred.reject();

                            switch (res.type) {
                                case "UserExists":
                                    break;
                            }

                            break;
                    }
                })

                .error(function(res) {
                    deferred.reject();
                });


            return deferred.promise;
        },

        register: function(email, password) {

            $http.post('/api/users', { email: email, password: password } )

                .success(function(res) {
                    console.log(res);
                })

                .error(function(res) {
                    console.log(res);
                });

        },

        login: function(email, password) {

            $http.post('/api/auth', { email: email, password: password } )

                .success(function(res) {

                })

                .error(function(res) {

                });

        },

        logout: function(sessionId) {

            $http.delete('/api/auth/' + sessionId)

                .success(function(res) {

                })

                .error(function(res) {

                });
        }
    }
});