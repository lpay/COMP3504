
app.directive('availabilityEditor', function($http, $uibModal) {
    return {
        restrict: 'E',

        scope: {availability: '=', 'group': '='},

        templateUrl: 'views/directives/availabilityEditor.html',

        link: function(scope) {

            var updateDescriptions = function() {
                scope.descriptions = [];

                scope.availability.hours.forEach(function(entry) {
                    if (entry.available) {

                        var description = '';

                        var start = moment().startOf('day').add(moment.duration(entry.start, 'seconds'));
                        var end = moment().startOf('day').add(moment.duration(entry.end, 'seconds'));

                        if (start.minutes() > 0)
                            description = start.format('h:mmA');
                        else
                            description = start.format('hA');

                        description += '-';

                        if (end.minutes() > 0)
                            description += end.format('h:mmA');
                        else
                            description += end.format('hA');

                        scope.descriptions.push(description);
                    }
                });

                if (scope.descriptions.length == 0)
                    scope.descriptions.push('Closed');
            };

            updateDescriptions();

            scope.edit = function() {

                var hours = [];

                scope.availability.hours.forEach(function(entry) {
                    hours.push({
                        start: moment().startOf('day').add(moment.duration(entry.start, 'seconds')),
                        end: moment().startOf('day').add(moment.duration(entry.end, 'seconds')),
                        available: entry.available
                    });
                });

                $uibModal
                    .open({
                        templateUrl: 'views/modals/availabilityModal.html',
                        controller: function($scope, $uibModalInstance) {

                            $scope.new = { available: true };
                            $scope.hours = hours;

                            $scope.save = function() {
                                $uibModalInstance.close($scope.hours);
                            };

                            $scope.close = function() {
                                $uibModalInstance.dismiss('cancel');
                            };

                            $scope.add = function() {
                                $scope.hours.push({
                                    start: $scope.new.start,
                                    end: $scope.new.end,
                                    available: $scope.new.available
                                });

                                $scope.new = { available: true };
                            };

                            $scope.remove = function(index) {
                                $scope.hours.splice(index, 1);
                            };

                            $scope.up = function(index) {
                                if (index <= 0 || $scope.hours.length < 2)
                                    return;

                                var hours = $scope.hours[index];

                                $scope.hours[index] = $scope.hours[index-1];
                                $scope.hours[index-1] = hours;
                            };

                            $scope.down = function(index) {
                                if (index >= $scope.hours.length || $scope.hours.length < 2)
                                    return;

                                var hours = $scope.hours[index];

                                $scope.hours[index] = $scope.hours[index+1];
                                $scope.hours[index+1] = hours;
                            };
                        }
                    }).result
                    .then(function(hours) {

                        scope.availability.hours = [];

                        hours.forEach(function(entry) {
                            scope.availability.hours.push({
                                start: moment.duration(moment(entry.start) - moment(entry.start).startOf('day')).asSeconds(),
                                end: moment.duration(moment(entry.end) - moment(entry.end).startOf('day')).asSeconds(),
                                available: entry.available
                            });
                        });

                        $http.put('/groups/' + encodeURIComponent(scope.group.slug), scope.group)
                            .success(function(s) {
                                updateDescriptions();
                            })
                            .error(function(e) {
                            });
                    })
                    .catch(function(reason) {

                    })
            };
        }
    }
});