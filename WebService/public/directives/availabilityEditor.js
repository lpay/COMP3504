
app.directive('availabilityEditor', function($http, $uibModal) {
    return {
        retrict: 'E',

        scope: { group: '=', member: '=' ,availability: '=' },

        templateUrl: 'views/directives/availabilityEditor.html',

        link: function(scope) {

            scope.descriptions = ['9AM-5PM'];


            scope.edit = function(availability) {

                $uibModal
                    .open({
                        templateUrl: 'views/modals/availabilityModal.html',
                        controller: function($scope, $uibModalInstance) {
                            $scope.new = {};
                            $scope.availability = availability;

                            $scope.save = function() {
                                $uibModalInstance.close($scope.availability);
                            };

                            $scope.close = function() {
                                $uibModalInstance.dismiss('cancel');
                            };

                            $scope.add = function() {
                                $scope.availability.hours.push({
                                    start: $scope.new.start,
                                    end: $scope.new.end,
                                    available: $scope.new.available
                                });

                                $scope.new = {};

                            };

                            $scope.remove = function(index) {
                                $scope.availability.hours.splice(index, 1);
                            };

                            $scope.up = function(index) {
                                if (index <= 0 || availability.hours.length < 2)
                                    return;

                                var hours = $scope.availability.hours[index];

                                $scope.availability.hours[index] = $scope.availability.hours[index-1];
                                $scope.availability.hours[index-1] = hours;
                            };

                            $scope.down = function(index) {
                                if (index >= $scope.availability.hours.length || $scope.availability.hours.length < 2)
                                    return;

                                var hours = $scope.availability.hours[index];

                                $scope.availability.hours[index] = $scope.availability.hours[index+1];
                                $scope.availability.hours[index+1] = hours;
                            };
                        }
                    }).result
                    .then(function(newAvailability) {
                        $http.put('/groups/' + encodeURIComponent(scope.group.slug), scope.group)
                            .success(function(s) {
                                console.log(s)
                            })
                            .error(function(e) {
                                console.log(e);
                            });
                    })
                    .catch(function(reason) {

                    })

            };
        }
    }
});