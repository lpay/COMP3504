/**
 *
 */

var app = angular.module('ScheduleUP', ['ionic', 'satellizer', 'ui.router', 'ion-datetime-picker'])

    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

        $urlRouterProvider.otherwise('/dashboard');

        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'views/Login.html',
                controller: 'LoginController'
            })

            .state('signup', {
                url: '/signup',
                templateUrl: 'views/Signup.html',
                controller: 'SignupController'
            })

            .state('logout', {
                url: '/logout',
                controller: 'LogoutController'
            })

            .state('dashboard', {
                url: '/dashboard',
                abstract: true,
                templateUrl: 'views/Dashboard.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('dashboard.home', {
                url: '',
                views: {
                    'home-tab': {
                        templateURL: 'views/Home.html',
                        controller: 'HomeController'
                    }
                }
            })

            .state('dashboard.search', {
                url: '/search',
                views: {
                    'search-tab': {
                        templateUrl: 'views/Search.html',
                        controller: 'SearchController'
                    }
                }
            })

            .state('dashboard.group', {
                url: '/group',
                params: { group: undefined },
                views: {
                    'search-tab': {
                        templateUrl: 'views/Group.html',
                        controller: 'GroupController'
                    }
                }
            })

            .state('dashboard.timeslots', {
              url: '/timeslots',
              params: { member: undefined,
                        group: undefined },
              views: {
                'search-tab': {
                  templateUrl: 'views/Timeslots.html',
                  controller: 'TimeslotsController'
                }
              }
            })

          .state('dashboard.bookappointmenttime', {
            url: '/bookappointmenttime',
            params: { timeslot: undefined,
                      member: undefined,
                      group: undefined },
            views: {
              'search-tab': {
                templateUrl: 'views/BookAppointmentTime.html',
                controller: 'BATController'
              }
            }
          })

            .state('dashboard.help', {
                url: '/help',
                views: {
                    'help-tab': {
                        template: '<ion-view title="Help"></ion-view>'
                    }
                }
            });

        function loginRequired($auth, $location, $q) {
            var deferred = $q.defer();

            if ($auth.isAuthenticated()) {
                deferred.resolve();
            } else {
                //$state.go('login');
                $location.path('/login');
            }

            return deferred.promise;
        }

        $ionicConfigProvider.tabs.position('bottom');
    })

    .config(function($authProvider) {
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

        $authProvider.loginUrl = 'http://localhost:3504/auth/login';
        $authProvider.signupUrl = 'http://localhost:3504/auth/signup';

        $authProvider.google(angular.extend({}, commonConfig, {
            clientId: '870728536471-ilmvcb2obgo6ioucqokrgvcj211nj7t3.apps.googleusercontent.com',
            url: 'http://localhost:3504/auth/google'
        }));
    })

    .run(function($ionicPlatform, $stateParams) {
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
        });
    });
