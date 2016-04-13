/**
 *
 */

(function() {
    angular
        .module('app', ['ionic', 'satellizer', 'ui.router', 'ionic-datepicker', 'uiGmapgoogle-maps', 'ui.filters'])
        .config(StateConfig)
        .config(AuthConfig)
        .run(Run);

    function StateConfig($stateProvider, $urlRouterProvider, $ionicConfigProvider, uiGmapGoogleMapApiProvider) {

        $ionicConfigProvider.tabs.position('bottom');

        $urlRouterProvider.otherwise('/home');

        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'views/Login.html',
                controller: 'LoginController',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })

            .state('signup', {
                url: '/signup',
                templateUrl: 'views/Signup.html',
                controller: 'SignupController',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })

            .state('logout', {
                url: '/logout',
                controller: 'LogoutController'
            })

            .state('app', {
                abstract: true,
                templateUrl: 'views/app.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'home-tab': {
                        templateUrl: 'views/Home.html',
                        controller: 'HomeController',
                        resolve: {
                            appointments: function($q, $http) {
                                var deferred = $q.defer();

                                $http.get('http://scheduleup.crazyirish.ca/appointments')
                                .success(function(appointments) {
                                    deferred.resolve(appointments);
                                })
                                .error(function(err){
                                    deferred.resolve([]);
                                });

                                return deferred.promise;
                            }
                        }
                    }
                }
            })

            .state('app.search', {
                url: '/search',
                views: {
                    'search-tab': {
                        templateUrl: 'views/Search.html',
                        controller: 'SearchController'
                    }
                }
            })

            .state('app.group', {
                url: '/group',
                params: {group: undefined},
                views: {
                    'search-tab': {
                        templateUrl: 'views/Group.html',
                        controller: 'GroupController'
                    }
                }
            })

            .state('app.book', {
                url: '/book',
                params: {group: undefined, timeslot: undefined},
                views: {
                    'search-tab': {
                        templateUrl: 'views/Book.html',
                        controller: 'BookController'
                    }
                }
            })

            .state('app.appointment', {
                url: '/appointment',
                params: {appointment: undefined},
                views: {
                    'home-tab': {
                        templateUrl: 'views/Appointment.html',
                        controller: 'AppointmentController'
                    }
                }
            });


        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyB7xdB1LlQv-J5H7TaxczIRGU2ZCroAweI',
            //v: '3.20', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization'
        });

        function skipIfLoggedIn($auth, $location, $q) {
            var deferred = $q.defer();

            if ($auth.isAuthenticated()) {
                $location.path('/home');
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        }
        
        function loginRequired($auth, $location, $q) {
            var deferred = $q.defer();

            if ($auth.isAuthenticated()) {
                deferred.resolve();
            } else {
                $location.path('/login');
            }

            return deferred.promise;
        }
    }
    
    function AuthConfig($authProvider) {
        var commonConfig = {
            popupOptions: {
                location: 'no',
                toolbar: 'yes',
                width: window.screen.width,
                height: window.screen.height
            }
        };

        if (ionic.Platform.isIOS() || ionic.Platform.isAndroid()) {
            commonConfig.redirectUri = 'http://localhost:8100';
        }

        $authProvider.loginUrl = 'http://scheduleup.crazyirish.ca/auth/login';
        $authProvider.signupUrl = 'http://scheduleup.crazyirish.ca/auth/signup';

        $authProvider.google(angular.extend({}, commonConfig, {
            clientId: '870728536471-ilmvcb2obgo6ioucqokrgvcj211nj7t3.apps.googleusercontent.com',
            url: 'http://scheduleup.crazyirish.ca/auth/google'
        }));
    }


    function Run($rootScope, $ionicPlatform, $stateParams) {
        $ionicPlatform.ready(function() {
            if(window.cordova && window.cordova.plugins.Keyboard) {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

                // Don't remove this line unless you know what you are doing. It stops the viewport
                // from snapping when text inputs are focused. Ionic handles this internally for
                // a much nicer keyboard experience.
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if(window.StatusBar) {
                StatusBar.styleDefault();
            }

            //Push Notifications
            /*var push = new Ionic.Push({});
             push.register(function(token) {
             console.log("Device token:",token.token);
             push.saveToken(token); // persist the totken in the Ionic

             })*/
        });
    }

})();
