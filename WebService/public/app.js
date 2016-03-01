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
                controller: 'JoinController',
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('dashboard', {
                url: '/dashboard',
                templateUrl: 'views/dashboard.html',
                resolve: {
                    loginRequired: loginRequired,
                    groups: function($state, $http, $q) {
                        var deferred = $q.defer();

                        $http.get('/groups')
                            .success(function(groups) {
                                if (groups.length)
                                    deferred.resolve(groups);
                                else
                                    $state.go('join');
                            })
                            .error(function() {
                                deferred.reject();
                            });

                        return deferred.promise;
                    }
                },
                params: { group: undefined },
                controller: function($state, $stateParams, $scope, groups) {
                    $scope.groups = groups;
                    $scope.group = $stateParams.group || groups[0];

                    $state.go('dashboard.scheduler');
                }
            })

            .state('dashboard.scheduler', {
                url: '/scheduler',
                templateUrl: 'views/scheduler.html',
                controller: 'SchedulerController'
            })

            .state('dashboard.settings', {
                url: '/settings',
                templateUrl: 'views/settings.html',
                controller: function($scope) {

                }
            })

            .state('dashboard.profile', {
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
    })

    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });