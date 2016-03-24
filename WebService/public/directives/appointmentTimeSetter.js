/**
 * Created by nwalker on 3/9/16.
 */
app.directive('appointmentTimeSetter', function($http, $uibModal) {
    return {
        restrict: 'E',

        scope: {profile: '='},

        templateUrl: 'views/directives/appointmentTimeSetter.html',

        link: function(scope) {


            scope.add = function() {

                scope.profile.user.appointmentTypes.push({
                    name: scope.new.name,
                    length: scope.new.length
                });
                console.log(scope.new);
                console.log(scope.profile.user);
                scope.new = { };
            };

            scope.remove = function(index) {
                scope.profile.user.appointmentTypes.splice(index, 1);
            };

            scope.up = function(index) {
                if (index <= 0 || scope.profile.appointmentTypes.length < 2)
                    return;

                var type = scope.profile.appointmentTypes[index];

                scope.profile.appointmentTypes[index] = scope.profile.appointmentTypes[index-1];
                scope.profile.appointmentTypes[index-1] = type;
            };

            scope.down = function(index) {
                if (index >= scope.profile.appointmentTypes.length || $scope.hours.length < 2)
                    return;

                var type = scope.profile.appointmentTypes[index];

                scope.profile.appointmentTypes[index] = scope.profile.appointmentTypes[index+1];
                scope.profile.appointmentTypes[index+1] = type;
            };

            scope.edit = function() {

                var hours = [];

                //scope.availability.hours.forEach(function(entry) {
                //    hours.push({
                //        start: moment().startOf('day').add(moment.duration(entry.start, 'seconds')),
                //        end: moment().startOf('day').add(moment.duration(entry.end, 'seconds')),
                //        available: entry.available
                //    });
                //});

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