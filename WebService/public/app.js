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

            .state('app', {
                abstract: true,
                templateUrl: 'views/app.html',
                controller: function($scope, $http) {
                    $scope.nav = [
                        { sref: 'app.profile',label: 'Profile' },
                        { sref: 'logout', label: 'Logout' }
                    ];

                    $http.get('/groups')
                        .success(function(groups){
                            $scope.groups = groups;
                        });

                    $scope.changeGroup = function(group){
                        $scope.group = group;

                        $scope.$apply();
                    }
                }
            })

            .state('app.dashboard', {
                abstract: true,
                url: '/dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardController',
                params: { group: {} },
                resolve: {
                    loginRequired: loginRequired,
                    groupRequired: groupRequired
                }
            })

            .state('app.dashboard.group', {
                url: '',
                templateUrl: 'views/group.html',
                controller: function($scope) {

                }
            })

            .state('app.dashboard.schedule', {
                url: '/schedule',
                templateUrl: 'views/schedule.html',
                controller: 'ScheduleController'
            })

            .state('app.profile', {
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