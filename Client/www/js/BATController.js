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
            console.log($scope);
            $http.post('http://localhost:3504/appointments',
                {
                    group: $scope.group._id,
                    member: $scope.member._id,
                    start: $scope.timeslot.start,
                    end: $scope.timeslot.end
                })
                .success(function() {

                })
                .error(function(err){

                });
        };
    });
