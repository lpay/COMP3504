/**
 * Created by Liddy on 18-Mar-2016.
 */

app.controller('TimeslotsController', function($scope, $stateParams) {

  $scope.member = $stateParams.member;
  $scope.group = $stateParams.group;

  console.log($scope.member);
  console.log($scope.group);
  console.log($scope.timeslot);
});
