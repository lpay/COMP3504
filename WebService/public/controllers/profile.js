/**
 * Created by mark on 2/18/16.
 */

(function() {
    angular
        .module('app')
        .controller('ProfileController', ProfileController);


    function ProfileController($scope, $location, $http) {
        $http.get('/profile')
            .success(function(profile) {

                $scope.group.members.some(function(member) {
                    if (member.user._id === profile._id) {
                        $scope.profile = member;
                        return true;
                    }
                });
            });
    }

})();