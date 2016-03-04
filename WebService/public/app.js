/**
 * Created by mark on 1/14/16.
 */

var app = angular.module('COMP3504', [ 'ui.router', 'satellizer', 'selectize', 'ui.bootstrap', 'ui.calendar' ])

    .config(function($authProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/dashboard/scheduler');

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
                abstract: true,
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

                    //$state.go('dashboard.scheduler');
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
                controller: function($scope, $http) {

                    $scope.Sunday = false;
                    $scope.Monday = true;
                    $scope.Tuesday = true;
                    $scope.Wednesday = true;
                    $scope.Thursday = true;
                    $scope.Friday = true;
                    $scope.Saturday = false;

                    $scope.save = function(){
                        $scope.daysInAWeek = [];

                        if ($scope.Sunday)
                            $scope.daysInAWeek.push( { day: "Sunday" } );
                        if ($scope.Monday)
                            $scope.daysInAWeek.push( { day: "Monday" } );
                        if ($scope.Tuesday)
                            $scope.daysInAWeek.push( { day: "Tuesday" } );
                        if ($scope.Wednesday)
                            $scope.daysInAWeek.push( { day: "Wednesday" } );
                        if ($scope.Thursday)
                            $scope.daysInAWeek.push( { day: "Thursday" } );
                        if ($scope.Friday)
                            $scope.daysInAWeek.push( { day: "Friday" } );
                        if ($scope.Saturday)
                            $scope.daysInAWeek.push( { day: "Saturday" } );

                        //[$scope.Sunday,$scope.Monday,$scope.Tuesday,$scope.Wednesday,
                          //                    $scope.Thursday,$scope.Friday,$scope.Saturday];

                        $http.put('/groups/' + encodeURIComponent($scope.group.slug), $scope.group)
                            .success(function() {

                            })
                            .error(function() {

                            });

                    };
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