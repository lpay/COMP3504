/**
 * Created by Liddy on 18-Mar-2016.
 */

(function() {
    angular
        .module('app')
        .controller('TimeslotsController', TimeslotsController);

    function TimeslotsController($scope, $stateParams, $ionicLoading) {
        $scope.member = $stateParams.member;
        $scope.group = $stateParams.group;
    }

})();