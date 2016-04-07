/**
 * Created by mark on 2/18/16.
 */

(function() {
    angular
        .module('app')
        .controller('ProfileController', ProfileController)
        .controller('ProfileAptSettingController', ProfileAptSettingController)
        .controller('ProfileHoursController', ProfileHoursController);

    function ProfileController($scope) {
        $scope.alerts = [];

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }

    /**
     * PROFILE WEEKLY HOURS SETTINGS/CONTROLLER
     */
    function ProfileHoursController($http, $scope) {
        $scope.alerts.length = 0;
        $scope.group = angular.copy($scope.currentGroup);

        $scope.$on('OnHoursChanged', function(event) {
            $http.put('/groups/' + encodeURIComponent($scope.currentGroup._id) + "/members/" + encodeURIComponent($scope.currentMember.user._id), {
                    availability: $scope.currentMember.availability
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

    /**
     * PROFILE Appointment Time Settings
     */

    function ProfileAptSettingController($http, $scope) {
        $scope.alerts.length = 0;
        $scope.interval = $scope.currentMember.interval || 15;
        $scope.appointmentTypes = $scope.appointmentTypes || [];
        $scope.appointmentTypes.length = 0;

        // convert from seconds to time of day
        $scope.currentMember.appointmentTypes.forEach(function (entry) {
            $scope.appointmentTypes.push({
                name: entry.name,
                length: entry.length / 60
            });
        });

        $scope.add = function() {

            if($scope.appointmentTypes > 5)return;

            $scope.appointmentTypes.push({length: 30});
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
            console.log($scope.interval);
            // TODO: we will have to put to /groups/:groupId/members/:memberId - need to create the route in the api
            $http.put('/groups/' + encodeURIComponent($scope.currentGroup._id) + "/members/" + encodeURIComponent($scope.currentMember.user._id), {
                    interval: $scope.interval,
                    appointmentTypes: appointmentTypes
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