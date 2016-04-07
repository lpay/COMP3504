/**
 *
 */

var app = angular.module('ScheduleUP', ['ionic', 'satellizer', 'ui.router', 'ion-datetime-picker'])
    //, 'uiGmapgoogle-maps', 'nemLogging'

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
                    templateUrl: 'views/Home.html',
                    controller: 'HomeController'
                  }
                },
                resolve: {
                  loginRequired: loginRequired
                }
            })

            .state('dashboard.appointmentdetail', {
                url: '/appointmentdetail',
                params: { appointment: undefined },
                views: {
                  'home-tab': {
                    templateUrl: 'views/AppointmentDetail.html',
                    controller: 'AppointmentDetailController'
                  }
                },
                resolve: {
                  loginRequired: loginRequired
                }
            })

            .state('dashboard.search', {
                url: '/search',
                views: {
                    'search-tab': {
                        templateUrl: 'views/Search.html',
                        controller: 'SearchController'
                    }
                },
                resolve: {
                loginRequired: loginRequired
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
                },
              resolve: {
                loginRequired: loginRequired
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
              },
              resolve: {
                loginRequired: loginRequired
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
            },
            resolve: {
              loginRequired: loginRequired
            }
          })

            .state('dashboard.help', {
                url: '/help',
                views: {
                    'help-tab': {
                        template: '<ion-view title="Help"></ion-view>'
                    }
                },
              resolve: {
                loginRequired: loginRequired
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

        $authProvider.loginUrl = 'http://scheduleup.crazyirish.ca/auth/login';
        $authProvider.signupUrl = 'http://scheduleup.crazyirish.ca/auth/signup';

        $authProvider.google(angular.extend({}, commonConfig, {
            clientId: '870728536471-ilmvcb2obgo6ioucqokrgvcj211nj7t3.apps.googleusercontent.com',
            url: 'http://scheduleup.crazyirish.ca/auth/google'
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

            //Push Notifications
            /*var push = new Ionic.Push({});
            push.register(function(token) {
              console.log("Device token:",token.token);
              push.saveToken(token); // persist the totken in the Ionic

            })*/
        });
    });
