/**
 * Created by mark on 2/19/16.
 */

(function() {

    angular
        .module('app')
        .controller('CalendarController', CalendarController);

    function CalendarController($scope, $uibModal) {
        var businessHours = [];
        var events = [];

        $scope.member.events.forEach(function(event) {
            events.push({
                title: event.type,
                start: new Date(event.start),
                end: new Date(event.end)
            })
        });

        $scope.eventSources = [businessHours, events];

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

                events.push({
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
            slotDuration: '00:15:00',
            defaultView: 'agendaWeek',
            allDaySlot: false,
            fixedWeekCount: false,
            minTime: '09:00',
            maxTime: '17:00',
            selectable: true,
            select: $scope.select,
            viewRender: function(view) {
                businessHours.length = 0;

                var availability = {};

                var min = 86400;
                var max = 0; // 24 hours

                $scope.currentGroup.defaultAvailability.forEach(function(day) {
                    availability[day.day] = day.hours;
                });

                for (var date = view.start.clone().startOf('day'); date < view.end; date.add(1, 'days')) {

                    var hours = availability[date.format('dddd')];

                    if (!hours || !hours.length)
                        continue;

                    hours.forEach(function(entry) {

                        if (entry.start < min) min = entry.start;
                        if (entry.end > max) max = entry.end;

                        businessHours.push({
                            start: moment(date).add(entry.start, 'seconds'),
                            end: moment(date).add(entry.end, 'seconds'),
                            rendering: 'background'
                        });
                    });
                }

                view.calendar.options.minTime = view.start.clone().startOf('day').add(min, 'seconds').format('HH:mm');
                view.calendar.options.maxTime = view.end.clone().startOf('day').add(max, 'seconds').format('HH:mm');
            }
        };
    }

})();