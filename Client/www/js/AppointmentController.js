/**
 * Created by Liddy on 02-Apr-2016.
 */


(function() {
    angular
        .module('app')
        .controller('DetailController', DetailController);

    function DetailController($scope, $stateParams) {
        $scope.appointment = $stateParams.appointment;
    }

})();