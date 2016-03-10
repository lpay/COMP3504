/**
 * Created by mark on 2/18/16.
 */

app.controller('ProfileController', function($scope, $location, $http) {


    $http.get('/profile')
        .success(function(profile) {

            $scope.group.members.some(function(member) {
                if (member.user._id === profile._id) {
                    $scope.profile = member;
                    return true;
                }
            });
        });



});
