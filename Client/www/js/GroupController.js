/**
 *
 */

app.controller('GroupController', function($scope, $stateParams) {
    $scope.group = $stateParams.group;

    console.log($scope.group);
});
