/**
 * Created by mark on 1/14/16.
 */

var app = angular.module('app', [ 'ui.router', 'ngMessages' ])

    .config([ '$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/dashboard');

        $stateProvider

            .state('login', {
                url: '/login',
                templateUrl: '/app/auth/auth.html',
                controller: 'AuthenticationController'
            })

            .state('dashboard', {
                url: '/dashboard',
                templateUrl: '/app/dashboard/dashboard.html'
            });
    }])

    .run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {

    }]);
