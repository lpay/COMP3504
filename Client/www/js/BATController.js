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
                    appointment: {
                        group: $scope.group._id,
                        member: $scope.member._id,
                        start: $scope.timeslot.start,
                        end: $scope.timeslot.end,
                        type: $scope.timeslot.type
                    }
                })
                .success(function() {
                  console.log("BOOKED");
                })
                .error(function(err){

                });
        };
    });
