// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('Client', ['ionic', 'satellizer'])

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider

      .state('login', {
        url: '/login',
        templateUrl: 'Login.html',
        controller: 'LoginController'
      })

      .state('signup', {
        url: '/signup',
        templateUrl: 'Signup.html',
        controller: 'SignupController'
      })

      .state('home', {
        url: '/',
        templateUrl: 'Home.html',
        controller: 'HomeController',
        resolve: {
          loginRequired: loginRequired
        }
      })

      .state('group', {
        url: '/groups',
        templateUrl: 'GroupSearch.html',
        controller: 'GroupSearchController',
        resolve: {
          loginRequired: loginRequired
        }
        })

          .state('users', {
            url: '/users',
            templateUrl: 'ProfessionalSearch.html',
            controller: 'ProfessionalSearchController',
            resolve: {
              loginRequired: loginRequired
            }

      });

    function loginRequired($q, $location, $auth) {
      var deferred = $q.defer();

      if ($auth.isAuthenticated()) {
        deferred.resolve();
      } else {
        $location.path('/login');
        //$stateProvider.go('login');
      }

      return deferred.promise;
    }

    $urlRouterProvider.otherwise('/');

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
      commonConfig.redirectUri = 'http://localhost:3504/';
    }

    $authProvider.loginUrl = 'http://localhost:3504/auth/login';
    $authProvider.signupUrl = 'http://localhost:3504/auth/signup';

    //$authProvider.locan(angular.extend({}, commonConfig, {
    //  url: 'http://localhost:3504/auth/login'
    //}));

    $authProvider.google(angular.extend({}, commonConfig, {
      clientId: '603122136500203',
      url: 'http://localhost:3504/auth/google'
    }));
  })

  .run(function($ionicPlatform) {


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
