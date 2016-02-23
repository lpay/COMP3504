/**
 * Created by mark on 1/14/16.
 */

var app = angular.module('COMP3504', [ 'ui.router', 'satellizer', 'selectize', 'ui.calendar' ])

    .config(function($authProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/dashboard');

        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: 'views/auth.html',
                controller: 'AuthenticationController',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })

            .state('logout', {
                url: '/logout',
                template: null,
                controller: 'LogoutController'
            })

            .state('join', {
                url: '/join',
                templateUrl: 'views/join.html',
                controller: 'GroupController',
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('dashboard', {
                abstract: true,
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardController',
                resolve: {
                    loginRequired: loginRequired,
                    groupRequired: groupRequired
                }
            })

            .state('calendar', {
                parent: 'dashboard',
                url: '/dashboard',
                templateUrl: 'views/schedule.html',
                controller: 'ScheduleController'
            })

            .state('profile', {
                parent: 'dashboard',
                url: '/profile',
                templateUrl: 'views/profile.html',
                controller: 'ProfileController'
            });

        $authProvider.google({
            clientId: '870728536471-ilmvcb2obgo6ioucqokrgvcj211nj7t3.apps.googleusercontent.com'
        });

        function skipIfLoggedIn($q, $auth) {
            var deferred = $q.defer();

            if ($auth.isAuthenticated()) {
                deferred.reject();
            } else {
                deferred.resolve();
            }

            return deferred.promise;
        }

        function loginRequired($q, $location, $auth) {
            var deferred = $q.defer();

            if ($auth.isAuthenticated()) {
                deferred.resolve();
            } else {
                $location.path('/login');
            }

            return deferred.promise;
        }

        function groupRequired($q, $http, $location) {
            var deferred = $q.defer();

            $http.get('/groups')
                .success(function(groups) {
                    if (groups.length) {
                        deferred.resolve();
                    } else {
                        $location.path('/join');
                    }
                })
                .error(function() {
                    deferred.reject();
                });

            return deferred.promise;
        }
    })

    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });