/**
 * Created by mark on 1/14/16.
 */

(function() {
    'use strict';

    angular
        .module('app', ['ui.router', 'satellizer', 'selectize', 'ui.bootstrap', 'ui.calendar'])
        .config(StateConfig)
        .config(AuthConfig)
        .run(Run);

    function AuthConfig($authProvider) {
        $authProvider.google({clientId: '870728536471-ilmvcb2obgo6ioucqokrgvcj211nj7t3.apps.googleusercontent.com'});
    }

    function StateConfig($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/login');

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
                controller: 'LogoutController'
            })

            .state('join', {
                url: '/join',
                templateUrl: 'views/join.html',
                controller: 'JoinController',
                params: {
                    currentGroup: undefined,
                    createMode: false
                },
                resolve: {
                    loginRequired: loginRequired
                }
            })

            .state('dashboard', {
                abstract: true,
                url: '/dashboard',
                templateUrl: 'views/dashboard.html',
                controller: 'DashboardController',
                params: {group: undefined},
                resolve: {
                    loginRequired: loginRequired,
                    profile: function($http, $q) {
                        var deferred = $q.defer();

                        $http.get('/profile')
                            .success(function(profile) {
                                if (!profile)
                                    deferred.reject('unable to get profile');

                                deferred.resolve(profile);
                            })
                            .error(function(err) {
                                deferred.reject(err);
                            });

                        return deferred.promise;
                    },
                    groups: function ($state, $http, $q) {
                        var deferred = $q.defer();

                        $http.get('/groups')
                            .success(function (groups) {
                                if (groups.length) {
                                    deferred.resolve(groups);
                                } else {
                                    deferred.reject();
                                    $state.go('join');
                                }
                            })
                            .error(function () {
                                deferred.reject();
                            });

                        return deferred.promise;
                    }
                }
            })

            .state('dashboard.scheduler', {
                url: '',
                templateUrl: 'views/scheduler.html',
                controller: 'SchedulerController'
            })

            /**
             * SETTINGS ROUTES
             */

            .state('dashboard.settings', {
                abstract: true,
                url: '/settings',
                templateUrl: 'views/settings/settings.html',
                controller: 'GroupSettingsController'
            })

            .state('dashboard.settings.groupInformation', {
                url: '/information',
                templateUrl: 'views/settings/information.html',
                controller: 'GroupInformationController'
            })

            .state('dashboard.settings.businessHours', {
                url: '/hours',
                templateUrl: 'views/settings/hours.html',
                controller: 'GroupHoursController'
            })

            .state('dashboard.settings.holidays', {
                url: '/holidays',
                templateUrl: 'views/settings/holidays.html'
            })

            .state('dashboard.settings.appointmentSettings', {
                url: '/appointments',
                templateUrl: 'views/settings/appointments.html',
                controller: 'GroupAppointmentSettingsController'
            })

            .state('dashboard.settings.members', {
                url: '/members',
                templateUrl: 'views/settings/members.html',
                controller: 'GroupMembersController'
            })

            .state('dashboard.settings.billing', {
                url: '/billing',
                templateUrl: 'views/settings/billing.html'
            })

            /**
             * PROFILE ROUTERS
             */

            .state('dashboard.profile', {
                abstract: true,
                url: '/profile',
                templateUrl: 'views/profile/profile.html',
                controller: 'ProfileController'
            })

            .state('dashboard.profile.businessHours', {
                url: '/hours',
                templateUrl: 'views/profile/hours.html'
            })

            .state('dashboard.profile.appointmentSettings', {
                url: '/appointments',
                templateUrl: 'views/profile/appointments.html',
                controller: 'ProfileAptSettingController'
            })

            .state('dashboard.profile.profileInformation', {
                url: '/information',
                templateUrl: 'views/profile/information.html'
            })

            .state('dashboard.profile.profileSettings', {
                url: '/confirmPassword',
                templateUrl: 'views/profile/account.html'
            });
    }

    function Run($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
    }

    function skipIfLoggedIn($auth, $q) {
        var deferred = $q.defer();

        if ($auth.isAuthenticated()) {
            deferred.reject();
        } else {
            deferred.resolve();
        }

        return deferred.promise;
    }

    function loginRequired($auth, $state, $q) {
        var deferred = $q.defer();

        if ($auth.isAuthenticated()) {
            deferred.resolve();
        } else {
            $state.go('login');
        }

        return deferred.promise;
    }

})();