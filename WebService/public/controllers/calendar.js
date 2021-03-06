/**
 * Created by mark on 2/19/16.
 */

(function() {

    angular
        .module('app')
        .controller('CalendarController', CalendarController);

    function CalendarController($http, $scope, $state, $uibModal) {
        var businessHours = [];
        var events = [];

        $scope.member.events.forEach(function (event) {
            events.push({
                title: event.client ? event.client.name.first + ' ' + event.client.name.last : event.title,
                start: new Date(event.start),
                end: new Date(event.end),
                event: event
            });
        });

        $scope.eventSources = [businessHours, events];

        $scope.calendar = {
            editable: true,
            header: {
                left: '',
                center: '',
                right: ''
                /*
                 left: 'month agendaWeek agendaDay',
                 center: 'title',
                 right: 'today prev,next'
                 */
            },
            eventOverlap: false,
            slotDuration: '00:15:00',
            defaultView: 'agendaWeek',
            allDaySlot: false,
            fixedWeekCount: false,
            minTime: '09:00',
            maxTime: '17:00',
            selectable: true,

            select: function (start, end, event, view) {

                $uibModal
                    .open({
                        templateUrl: 'createEvent.html',
                        controller: function ($scope, $uibModalInstance) {
                            $scope.event = {
                                startDate: start.format('MM-DD-YYYY'),
                                startTime: start.format('HH:mm'),
                                endDate: end.format('MM-DD-YYYY'),
                                endTime: end.format('HH:mm'),
                                available: 'available'
                            };

                            $scope.save = function () {
                                $uibModalInstance.close($scope.event);
                            };

                            $scope.cancel = function () {
                                $uibModalInstance.dismiss('cancel');
                            };
                        }
                    }).result
                    .then(function (event) {

                        return $http.post('/events', {
                                group: $scope.currentGroup._id,
                                member: $scope.member.user._id,
                                title: event.title,
                                start: new Date(event.startDate + ' ' + event.startTime),
                                end: new Date(event.endDate + ' ' + event.endTime),
                                available: event.available == 'available',
                                notes: event.notes
                            })
                            .success(function() {
                                $state.reload();
                                /*
                                events.push({
                                    title: event.title,
                                    start: new Date(event.startDate + ' ' + event.startTime),
                                    end: new Date(event.endDate + ' ' + event.endTime),
                                    event: event
                                });
                                */


                                //view.displayEvents(events);
                            })
                            .error(function (err) {

                            });
                    });
            },

            eventClick: function(event, e, view) {
                var originalEvent = event.event;

                console.log(event);
                $uibModal.open({
                    templateUrl: 'editEvent.html',
                    controller: function($scope, $uibModalInstance) {
                        $scope.event = {
                            title: event.event.title,
                            startDate: event.start.format('MM-DD-YYYY'),
                            startTime: event.start.format('h:mm a'),
                            endDate: event.end.format('MM-DD-YYYY'),
                            endTime: event.end.format('h:mm a'),
                            client: event.event.client,
                            available: event.event.available ? 'available' : 'unavailable'
                        };

                        $scope.save = function() {
                            $uibModalInstance.close($scope.event);
                        };

                        $scope.delete = function() {
                            $http.delete('/events/' + encodeURIComponent(event.event._id))
                                .success(function() {
                                    $state.reload();
                                })
                                .finally(function() {
                                    $uibModalInstance.close();
                                });
                        };

                        $scope.cancel = function() {
                            $uibModalInstance.dismiss('cancel');
                        };
                    }
                }).result
                .then(function(event) {
                    if (event) {

                    }
                });

            },

            viewRender: function (view) {
                businessHours.length = 0;

                var availability = {};

                var min = 86400;
                var max = 0; // 24 hours

                /*
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
                 */

                //view.calendar.options.minTime = view.start.clone().startOf('day').add(min, 'seconds').format('HH:mm');
                //view.calendar.options.maxTime = view.end.clone().startOf('day').add(max, 'seconds').format('HH:mm');
            }
        };
    }
})();
