/**
 * Created by mark 2/15/16.
 *
 */

(function() {
    'use strict';

    angular
        .module('app')
        .directive('hoursEditor', HoursEditor);

    function HoursEditor($uibModal) {
        return {
            restrict: 'E',

            scope: {
                summaryTemplate: '@',
                modalTemplate: '@',
                entryTitle: '=',
                hours: '='
            },

            template: '<div ng-include="summaryTemplate"></div>',

            controller: function ($scope) {

                var updateDescriptions = function () {
                    $scope.descriptions = [];

                    $scope.hours.forEach(function (entry) {
                        if (entry.available) {
                            var start = moment().startOf('day').add(moment.duration(entry.start, 'seconds'));
                            var end = moment().startOf('day').add(moment.duration(entry.end, 'seconds'));

                            $scope.descriptions.push(
                                (start.minutes() > 0 ? start.format('h:mmA') : start.format('hA')) + '-' +
                                (end.minutes() > 0 ? end.format('h:mmA') : end.format('hA'))
                            );
                        }
                    });
                };

                updateDescriptions();

                $scope.edit = function () {

                    var title = $scope.entryTitle;
                    var hours = [];

                    // convert from seconds to time of day
                    $scope.hours.forEach(function (entry) {
                        hours.push({
                            start: moment().startOf('day').add(moment.duration(entry.start, 'seconds')),
                            end: moment().startOf('day').add(moment.duration(entry.end, 'seconds')),
                            available: entry.available
                        });
                    });

                    $uibModal
                        .open({
                            templateUrl: $scope.modalTemplate,

                            controller: function ($scope, $uibModalInstance) {
                                $scope.title = title;
                                $scope.hours = hours;
                                $scope.new = {available: true};

                                $scope.save = function () {
                                    $uibModalInstance.close($scope.hours);
                                };

                                $scope.close = function () {
                                    $uibModalInstance.dismiss('cancel');
                                };

                                $scope.add = function () {
                                    $scope.hours.push({
                                        start: $scope.new.start,
                                        end: $scope.new.end,
                                        available: $scope.new.available
                                    });

                                    $scope.new = {available: true};
                                };

                                $scope.remove = function (index) {
                                    $scope.hours.splice(index, 1);
                                };

                                $scope.up = function (index) {
                                    if (index <= 0 || $scope.hours.length < 2)
                                        return;

                                    var entry = $scope.hours[index];

                                    $scope.hours[index] = $scope.hours[index - 1];
                                    $scope.hours[index - 1] = entry;
                                };

                                $scope.down = function (index) {
                                    if (index >= $scope.hours.length || $scope.hours.length < 2)
                                        return;

                                    var entry = $scope.hours[index];

                                    $scope.hours[index] = $scope.hours[index + 1];
                                    $scope.hours[index + 1] = entry;
                                };
                            }
                        }).result
                        .then(function (hours) {

                            // convert back to seconds...
                            hours.forEach(function (entry) {
                                entry.start = moment.duration(moment(entry.start) - moment(entry.start).startOf('day')).asSeconds();
                                entry.end = moment.duration(moment(entry.end) - moment(entry.end).startOf('day')).asSeconds();
                            });

                            // copy back to original
                            angular.copy(hours, $scope.hours);

                            updateDescriptions();

                            $scope.$emit('OnHoursChanged', hours);
                        })
                        .catch(function (reason) {
                            // modal was dismissed
                        })
                };
            }
        }
    }

})();