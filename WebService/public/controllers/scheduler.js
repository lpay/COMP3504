/**
 * Created by mark on 2/29/16.
 */

app

    .controller('SchedulerController', function($scope) {

        $scope.uiConfig = {
            calendar: {
                editable: true,
                header: {
                    left: 'month agendaWeek agendaDay',
                    center: 'title',
                    right: 'today prev,next'
                },
                selectable: true,
                select: function(start, end) {

                }
            }
        };

        $scope.eventSources = [];

        $scope.initialize = function() {
        };


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
                        selectedCss: {opacity: 1},
                        outerCss: {opacity: 0.1},
                    });
                }, 0, false);
            }
        };
    });
