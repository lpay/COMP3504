/**
 * Created by mark on 2/29/16.
 */

(function() {
    angular
        .module('app')
        .controller('GroupSettingsController', GroupSettingsController)
        .controller('GroupInformationController', GroupInformationController)
        .controller('GroupHoursController', GroupHoursController)
        .controller('GroupAppointmentSettingsController', GroupAppointmentSettingsController);

    function GroupSettingsController($scope) {
        $scope.alerts = [];

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }

    function GroupInformationController($http, $scope) {
        $scope.group = angular.copy($scope.currentGroup);

        $scope.save = function () {
            $http.put('/groups/' + encodeURIComponent($scope.group._id), {
                name: $scope.group.name,
                address: $scope.group.address,
                city: $scope.group.city,
                province: $scope.group.province,
                postalCode: $scope.group.postalCode,
                tags: $scope.group.tags,
                contact: $scope.group.contact,
                email: $scope.group.email,
                phone: $scope.group.phone
            })
            .success(function (group) {
                angular.copy(group, $scope.currentGroup);

                $scope.alerts.push({type: 'success', msg: 'Changes saved.'});
            })
            .error(function (err) {
                console.log(err);
                if (err.message)
                    $scope.alerts.push({type: 'danger', msg: 'Error: ' + err.message});
                else
                    $scope.alerts.push({type: 'danger', msg: 'An unknown error has occurred.'});
            });
        }
    }

    function GroupHoursController($http, $scope) {
        $scope.group = angular.copy($scope.currentGroup);

        $scope.$on('OnHoursChanged', function(event) {
            $http.put('/groups/' + encodeURIComponent($scope.group._id), {
                    defaultAvailability: $scope.group.defaultAvailability
                })
                .success(function (group) {
                    angular.copy(group, $scope.currentGroup);

                    $scope.alerts.push({type: 'success', msg: 'Changes saved.'});
                })
                .error(function (err) {
                    if (err.message)
                        $scope.alerts.push({type: 'danger', msg: 'Error: ' + err.message});
                    else
                        $scope.alerts.push({type: 'danger', msg: 'An unknown error has occurred.'});
                })
        });
    }

    function GroupAppointmentSettingsController($http, $scope) {
        $scope.interval = $scope.currentGroup.defaultInterval || 15;
        $scope.appointmentTypes = $scope.appointmentTypes || [];
        $scope.appointmentTypes.length = 0;

        // convert from seconds to time of day
        $scope.currentGroup.defaultAppointments.forEach(function (entry) {
            $scope.appointmentTypes.push({
                name: entry.name,
                length: entry.length / 60
            });
        });

        $scope.add = function() {
            $scope.appointmentTypes.push({});
        };

        $scope.remove = function(index) {
            $scope.appointmentTypes.splice(index, 1);
        };

        $scope.up = function(index) {
            var entry = $scope.appointmentTypes[index];

            $scope.appointmentTypes[index] = $scope.appointmentTypes[index - 1];
            $scope.appointmentTypes[index - 1] = entry;
        };

        $scope.down = function(index) {
            var entry = $scope.appointmentTypes[index];

            $scope.appointmentTypes[index] = $scope.appointmentTypes[index + 1];
            $scope.appointmentTypes[index + 1] = entry;
        };

        $scope.save = function() {
            var appointmentTypes = [];

            // convert back to seconds...
            $scope.appointmentTypes.forEach(function (entry) {
                appointmentTypes.push({
                    name: entry.name,
                    length: entry.length * 60
                });
            });

            $http.put('/groups/' + encodeURIComponent($scope.currentGroup._id), {
                    defaultInterval: $scope.interval,
                    defaultAppointments: appointmentTypes
                })
                .success(function(group) {
                    angular.copy(group, $scope.currentGroup);

                    $scope.alerts.push({type: 'success', msg: 'Changes saved.'});
                })
                .error(function (err) {
                    if (err.message)
                        $scope.alerts.push({type: 'danger', msg: 'Error: ' + err.message});
                    else
                        $scope.alerts.push({type: 'danger', msg: 'An unknown error has occurred.'});
                });
        };
    }

})();