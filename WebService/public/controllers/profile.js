/**
 * Created by mark on 2/18/16.
 */

app.controller('ProfileController', function($scope, $location, $http) {

    $http.get('/profile')
        .success(function(profile) {
            $scope.profile = profile;
        });

});
