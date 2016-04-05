/**
 * Created by mark on 2/18/16.
 */

(function() {
    angular
        .module('app')
        .controller('ProfileController', ProfileController)
        .controller('ProfileAptSettingController', ProfileAptSettingController);

    function ProfileController($scope) {

    }

    /**
     * PROFILE Appointment Time Settings
     */

    function ProfileAptSettingController($http, $scope) {

        //$scope.interval = $scope.currentGroup.defaultInterval || 15;
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
            if($scope.appointmentTypes > 5){return;}
            $scope.appointmentTypes.push({});
        };

        $scope.remove = function(index) {
            $scope.profile.appointments.splice(index, 1);
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

            // TODO: we will have to put to /groups/:groupId/members/:memberId - need to create the route in the api
            $http.put('/groups/' + encodeURIComponent($scope.currentGroup._id), {
                    //interval: $scope.interval,
                    "member.appointmentTypess": appointmentTypes
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