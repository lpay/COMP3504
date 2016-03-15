/**
 * Created by Johnny Admin on 2/29/2016.
 */

app.controller('SearchController', function($scope, $http, $location, $auth, $ionicSideMenuDelegate, $ionicLoading, $state) {

    $scope.groups = [];


    $scope.doSearch = function() {
        $scope.show($ionicLoading);

        $http.get('http://localhost:3504/appointments/search', { search: $scope.search })
            .success(function(groups) {
                console.log(groups);
                $scope.groups = groups;
            })
            .error(function (err) {

            })
            .finally(function ($ionicLoading) {
                // On both cases hide the loading
                $scope.hide($ionicLoading);
            });
    };

    $scope.goToGroupSearch = function(){
        $location.path("/groups");
        console.log("Redirect Success!");
    };

    $scope.goToProfessionalSearch = function(){
        $location.path("/users");
        console.log("Redirect Success!");
    };


    $scope.goToHome = function(){
        $location.path("/");
        console.log("Redirect Success!");
    };

    $scope.show = function() {
        $ionicLoading.show({
            template: '<p>Searching</p><ion-spinner></ion-spinner>'
        });
    };

    $scope.hide = function() {
        $ionicLoading.hide();
    };

    $scope.toggleLeft  = function() {
        $ionicSideMenuDelegate.toggleLeft();
    };

    $scope.clearSearch = function() {
        $scope.search = "";
        $scope.groups = [];

    };

    $scope.toggleRight = function() {
        $ionicSideMenuDelegate.toggleRight();
    };

    $scope.logout = function (){
        $auth.logout()
            .then(function () {
                $location.path('/login');
                console.log("Logout Success!");
            });
    };

});

