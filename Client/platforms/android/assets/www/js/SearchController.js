/**
 * Created by Johnny on 2/29/2016.
 */

(function() {
    angular
        .module('app')
        .controller('SearchController', SearchController);

    function SearchController($scope, $http, $ionicLoading, ionicDatePicker) {
        $scope.groups = [];

        $scope.search = {string: ''};

        $scope.findGroups = function() {

            $ionicLoading.show({template: '<p>Searching</p><ion-spinner></ion-spinner>'});

            $http.get('http://localhost:3504/groups/search/' + encodeURIComponent($scope.search.string))
                .success(function(groups) {
                    $scope.groups = groups;
                })
                .error(function (err) {
                    // TODO: visual error notification
                })
                .finally(function() {
                    $ionicLoading.hide();
                });
        };
    }


})();
