/**
 * Created by Johnny on 3/22/2016.
 */

(function() {
    angular
        .module('app')
        .controller('BookController', BookController);

    function BookController($state, $scope, $stateParams, $http) {
        $scope.group = $stateParams.group;
        $scope.timeslot = $stateParams.timeslot;

        $scope.book = function() {

            $http.post('http://scheduleup.crazyirish.ca/appointments', {
                    group: $scope.group._id,
                    member: $scope.timeslot.user,
                    start: $scope.timeslot.start,
                    end: $scope.timeslot.end,
                })
                .success(function() {
                    // TODO: redirect to appointment details/cancellation page
                    $state.go('app.home');
                })
                .error(function(err){
                    // TODO: visual error
                });
        };

    }


})();
