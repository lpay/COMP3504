/**
 * Created by mark on 1/14/16.
 */

var app = angular.module('COMP3504', [ 'ui.router', 'ngMessages', 'satellizer', 'selectize' ])

    .config(function($authProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/dashboard');

        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: '/app/auth/auth.html',
                controller: 'AuthenticationController',
                resolve: {
                    skipIfLoggedIn: skipIfLoggedIn
                }
            })

            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/app/dashboard/dashboard.html',
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('join', {
                url: '/join',
                templateUrl: '/app/dashboard/join.html',
                controller: 'GroupController',
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('logout', {
                url: '/logout',
                template: null,
                controller: 'LogoutController'
            });


        $authProvider.google({
            //url: '/api/auth/google',
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

    .run();