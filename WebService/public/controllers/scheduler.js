/**
 * Created by mark on 2/29/16.
 */

(function() {
    angular
        .module('app')
        .controller('SchedulerController', SchedulerController)
        .directive('calendarFlow', CalendarFlow);

    function SchedulerController($scope) {

        $scope.index = 0;

        $scope.$on('OnCalendarChanged', function(event, index) {
            //console.log(index);
        });
    }

    function CalendarFlow() {
        return {
            restrict: 'A',
            link: function(scope, element) {
                element.coverflow({
                    easing: 'swing',
                    duration: 'slow',
                    visible: 'density',
                    index: scope.index || 0,
                    selectedCss: {opacity: 1},
                    outerCss: {opacity: 0.33},
                    select: function(event, element, index) {
                        scope.$emit('OnCalendarChanged', index);
                    }
                });
            }
        };
    }

})();