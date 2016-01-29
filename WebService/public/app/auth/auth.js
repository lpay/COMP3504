/**
 * Created by mark on 1/14/17.
 */

app.controller('AuthenticationController', function($scope, $http, AuthenticationService) {

        /**
         * login
         */
        $scope.login = function() {
            AuthenticationService.login($scope.login.email, $scope.login.password);
        };

        /**
         * google
         */
        $scope.google = function() {
            console.log('google');
        };

        /**
         * facebook
         */
        $scope.facebook = function() {
            console.log('facebook');
        };

        /**
         * register
         */
        $scope.register = function () {
            AuthenticationService.register($scope.register.email, $scope.register.password);
        };

        /**
         * logout
         */
        $scope.logout = function () {
            AuthenticationService.logout();
        };
    })

    .directive('emailValidator', function(AuthenticationService) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function(scope, element, attrs, ngModel) {
                ngModel.$asyncValidators.unique = AuthenticationService.validateEmail;
            }
        }
    })

    .service('AuthenticationService', function($q, $http) {
        var token;


        return {
            validateEmail: function(email) {
                var deferred = $q.defer();

                $http.post('/api/users', { email: email } )


                    .success(function(res) {
                        deferred.resolve();
                    })

                    .error(function(res) {
                        deferred.reject(res.error);
                    });


                return deferred.promise;
            },

            register: function(email, password) {

                $http.post('/api/users', { email: email, password: password })

                    .success(function(res) {

                    })

                    .error(function(res) {

                    });

            },

            login: function(email, password) {

                $http.post('/api/auth', { "email": email, "password": password })

                    .success(function(res) {
                        console.log(res);
                    })

                    .error(function(res) {
                        console.log(res);
                    });

            },

            logout: function(token) {

                $http.delete('/api/auth', { token: token })

                    .success(function(res) {

                    })

                    .error(function(res) {

                    });
            }
        }
    });