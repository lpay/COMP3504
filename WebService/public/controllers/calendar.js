/**
 * Created by mark on 2/19/16.
 */

(function() {

    angular
        .module('app')
        .controller('CalendarController', CalendarController);

    function CalendarController($scope, $uibModal) {
        $scope.events = [];
        $scope.eventSources = [$scope.events];

        console.log($scope.member.events);
        $scope.member.events.forEach(function(event) {
            $scope.events.push({
                title: 'Basic Appointment',
                start: new Date(event.start),
                end: new Date(event.end)
            })
        })




        $scope.select = function (start, end) {

            $uibModal
                .open({
                    templateUrl: 'createEvent.html',
                    controller: function ($scope, $uibModalInstance) {
                        $scope.event = {
                            startDate: start.format('MM-DD-YYYY'),
                            startTime: start.format('HH:mm'),
                            endDate: end.format('MM-DD-YYYY'),
                            endTime: end.format('HH:mm'),
                            availability: 'available'
                        };

                        $scope.save = function () {
                            $uibModalInstance.close($scope.event);
                        };

                        $scope.cancel = function () {
                            $uibModalInstance.dismiss('cancel');
                        };
                    }
                })
                .result.then(function (event) {

                $scope.events.push({
                    title: event.title,
                    start: new Date(event.startDate + ' ' + event.startTime),
                    end: new Date(event.endDate + ' ' + event.endTime)
                });
            });


        };

        $scope.calendar = {
            editable: true,
            header: {
                left: 'month agendaWeek agendaDay',
                center: 'title',
                right: 'today prev,next'
            },
            businessHours: {
                start: '9:00',
                end: '18:00'
            },
            minTime: '9:00',
            maxTime: '18:00',
            slotDuration: '00:15:00',
            defaultView: 'agendaWeek',
            allDaySlot: false,
            fixedWeekCount: false,
            selectable: true,
            select: $scope.select
        };

    }

})();