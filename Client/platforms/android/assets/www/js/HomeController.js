/**
 * Created by Liddy on 30-Mar-2016.
 */

(function() {
    angular
        .module('app')
        .controller('HomeController', HomeController);

    function HomeController($scope, $stateParams, $http) {

        $http.get('http://scheduleup.crazyirish.ca/appointments')
            .success(function(appointments) {
                $scope.appointments = appointments;
            })
            .error(function(err){
                // TODO: visual error
            });
    }
})();