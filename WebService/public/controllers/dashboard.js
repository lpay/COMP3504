/**
 * Created by mark on 2/6/16.
 *
 */

(function() {
    
    angular
        .module('app')
        .controller('DashboardController', DashboardController);

    function DashboardController($scope, $stateParams, groups) {
        $scope.groups = groups;
        $scope.currentGroup = $stateParams.group || groups[0];
    }

})();