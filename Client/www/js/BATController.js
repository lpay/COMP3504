/**
 * Created by Johnny Admin on 3/22/2016.
 */
app.controller('BATController', function($scope, $stateParams) {

  $scope.member = $stateParams.member;
  $scope.timeslot = $stateParams.timeslot;

  console.log($scope.member);
  console.log($scope.timeslot);
});
