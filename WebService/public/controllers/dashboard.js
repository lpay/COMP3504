/**
 * Created by mark on 2/6/16.
 *
 */

(function() {
    
    angular
        .module('app')
        .controller('DashboardController', DashboardController);

    function DashboardController($scope, $stateParams, profile, groups) {
        $scope.groups = groups;

        // sync the passed in group with the groups array
        // TODO: we should be using a service to control access to the group
        if ($stateParams.group) {
            $scope.groups.some(function(group) {
                if ($stateParams.group._id === group._id) {
                    $scope.currentGroup = group;
                    return true;
                }
            })
        }

        if (!$scope.currentGroup) $scope.currentGroup = groups[0];

        $scope.currentGroup.members.some(function(member) {
            if (member.user._id === profile._id) {
                $scope.currentMember = member;
                return true;
            }
        });
    }

})();