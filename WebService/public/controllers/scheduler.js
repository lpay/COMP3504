/**
 * Created by mark on 2/29/16.
 */

(function() {
    angular
        .module('app')
        .controller('SchedulerController', SchedulerController)

    function SchedulerController($scope) {

        $scope.index = 0;

        $scope.$on('OnCalendarChanged', function(event, index) {
            //console.log(index);
        });
    }



})();