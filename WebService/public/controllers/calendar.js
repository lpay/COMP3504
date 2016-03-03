/**
 * Created by mark on 2/19/16.
 */

app.controller('CalendarController', function($scope, $compile, $uibModal, $http) {

    $scope.events = [];
    $scope.eventSources = [$scope.events];

    $scope.select = function(start, end) {

        $uibModal
            .open({
                templateUrl: 'createEvent.html',
                controller: function($scope, $uibModalInstance) {
                    $scope.event = {
                        startDate: start.format('MM-DD-YYYY'),
                        startTime: start.format('HH:mm'),
                        endDate: end.format('MM-DD-YYYY'),
                        endTime: end.format('HH:mm'),
                        availability: 'available'
                    };

                    $scope.save = function() {
                        $uibModalInstance.close($scope.event);
                    };

                    $scope.cancel = function() {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            })
            .result.then(function(event) {


                $http
                    .post('/events', {
                        title: event.title,
                        start: new Date(event.startDate + ' ' + event.startTime),
                        end: new Date(event.endDate + ' ' + event.endTime)
                    })
                $scope.events.push();
        });


    };

    $scope.calendar =  {
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
});
