/**
 * Created by mark on 2/29/16.
 */

app

    .controller('SchedulerController', function($scope) {
        $scope.index = 0;

        $scope.$on('OnCalendarChanged', function(event, index) {
            //console.log(index);
        });
    })

    .directive('coverflow', function($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element) {
                $timeout(function() {

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
                }, 0, false);
            }
        };
    });
