/**
 * Created by Johnny Admin on 3/22/2016.
 */
app.controller('BATController', function($scope, $stateParams) {

  $scope.member = $stateParams.member;
  $scope.timeslot = $stateParams.timeslot;
  $scope.group = $stateParams.group;

  console.log($scope.member);
  console.log($scope.timeslot);
  console.log($scope.group);
});
