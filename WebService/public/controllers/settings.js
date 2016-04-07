/**
 * Created by mark on 2/29/16.
 */

(function() {
    angular
        .module('app')
        .controller('GroupSettingsController', GroupSettingsController)
        .controller('GroupInformationController', GroupInformationController)
        .controller('GroupHoursController', GroupHoursController)
        .controller('GroupAppointmentSettingsController', GroupAppointmentSettingsController)
        .controller('GroupMembersController', GroupMembersController);

    function GroupSettingsController($scope) {
        $scope.alerts = [];

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }

    function GroupInformationController($http, $scope) {
        $scope.alerts.length = 0;
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
        $scope.alerts.length = 0;
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
        $scope.alerts.length = 0;
        $scope.interval = $scope.currentGroup.defaultInterval || 15;
        $scope.appointmentTypes = $scope.appointmentTypes || [];
        $scope.appointmentTypes.length = 0;

        // convert from seconds to time of day
        $scope.currentGroup.defaultAppointmentTypes.forEach(function (entry) {
            $scope.appointmentTypes.push({
                name: entry.name,
                length: entry.length / 60
            });
        });

        $scope.add = function() {
            if ($scope.appointmentTypes > 5)
                return;

            $scope.appointmentTypes.push({length: 45});

            console.log($scope.appointmentTypes);
        };

        $scope.remove = function(index) {
            if ($scope.appointmentTypes.length > 0)
                $scope.appointmentTypes.splice(index, 1);
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
                    defaultAppointmentTypes: appointmentTypes
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

    function GroupMembersController($http, $scope) {
        $scope.alerts.length = 0;

        $scope.remove = function(index) {
            $http.delete('/groups/' + encodeURIComponent($scope.currentGroup._id) + '/members/' + $scope.currentGroup.members[index].user._id)
                .success(function() {
                    for (var i = $scope.currentGroup.members - 1; i >= 0; i--) {
                        if ($scope.currentGroup.members[i].user._id === memberId)
                            $scope.currentGroup.members.splice(i, 1);
                    }

                    $scope.$apply();
                })
                .error(function(err) {
                    if (err.message)
                        $scope.alerts.push({type: 'danger', msg: 'Error: ' + err.message});
                    else
                        $scope.alerts.push({type: 'danger', msg: 'An unknown error has occurred.'});
                });
        };
    }
})();