/**
 * Created by Liddy on 18-Mar-2016.
 */

app.controller('TimeslotsController', function($scope, $stateParams) {

  $scope.member = $stateParams.member;

  console.log($scope.member);
});
