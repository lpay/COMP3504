/**
 * Created by mark on 2/6/16.
 *
 */

app.controller('DashboardController', function($scope, $stateParams) {
    $scope.user = {'name': 'test'};
    $scope.group = $stateParams.group;
});