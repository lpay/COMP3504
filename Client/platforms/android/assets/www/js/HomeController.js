/**
 * Created by Liddy on 30-Mar-2016.
 */

(function() {
    angular
        .module('app')
        .controller('HomeController', HomeController);

    function HomeController($scope, $ionicHistory, appointments) {
        $scope.appointments = appointments;

        $scope.$on("$ionicView.afterLeave", function () {
            $ionicHistory.clearCache();
        });
    }
})();