/**
 * Created by Johnny on 2/29/2016.
 */

(function() {
    angular
        .module('app')
        .controller('SearchController', SearchController);

    function SearchController($scope, $http, $ionicLoading) {
        $scope.groups = [];

        $scope.search = {string: ''};

        $scope.findGroups = function() {

            $ionicLoading.show({template: '<p>Searching</p><ion-spinner></ion-spinner>'});

            $http.get('http://scheduleup.crazyirish.ca/groups/search/' + encodeURIComponent($scope.search.string))
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
