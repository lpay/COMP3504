/**
 * Created by Johnny Admin on 2/29/2016.
 */

app.controller('SearchController', function($scope, $http, $location, $auth, $ionicSideMenuDelegate, $ionicLoading, $state) {

    $scope.groups = [];
    $scope.desiredTime = new Date();
    $scope.timepickerTitle = "Select desired appointment time:";

    $scope.doSearch = function() {
        $scope.show($ionicLoading);

        $http.get('http://localhost:3504/appointments/search', { search: $scope.search, start: $scope.desiredTime })
            .success(function(groups, desiredTime) {
                console.log(groups);
                console.log(desiredTime);
                $scope.groups = groups;
                $scope.start = desiredTime;
            })
            .error(function (err) {

            })
            .finally(function ($ionicLoading) {
                // On both cases hide the loading
                $scope.hide($ionicLoading);
            });
    };

    $scope.show = function() {
        $ionicLoading.show({
            template: '<p>Searching</p><ion-spinner></ion-spinner>'
        });
    };

    $scope.hide = function() {
        $ionicLoading.hide();
    };

    $scope.clearSearch = function() {
        $scope.search = "";
        $scope.groups = [];

    };

});

