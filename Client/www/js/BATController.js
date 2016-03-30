/**
 * Created by Johnny Admin on 3/22/2016.
 */
app

  .controller('BATController', function($scope, $stateParams, $http) {

    $scope.member = $stateParams.member;
    $scope.timeslot = $stateParams.timeslot;
    $scope.group = $stateParams.group;

    console.log($scope.member);
    console.log($scope.timeslot);
    console.log($scope.group);

    $scope.bookAppt= function() {

      $http.post('http://localhost:3504/appointments', {
              group: $scope.group._id, start: $scope.timeslot.start, end: $scope.timeslot.end, member: $scope.member._id } )
        .success(function() {

        })
        .error(function(err){


        });


    };

});
