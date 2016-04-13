/**
 * Created by Liddy on 02-Apr-2016.
 */


(function() {
    angular
        .module('app')
        .controller('AppointmentController', AppointmentController);

    function AppointmentController($scope, $stateParams, $timeout, uiGmapGoogleMapApi) {
        $scope.appointment = $stateParams.appointment;


        uiGmapGoogleMapApi.then(function(maps) {
            var geocoder = new maps.Geocoder();

            var address = $scope.appointment.address + ' ' + $scope.appointment.city + ', ' + $scope.appointment.province + ' ' + $scope.appointment.postalCode;

            geocoder.geocode({address: address}, function(results, status) {
                $timeout(function() {
                    if (status === "OK" && results.length > 0) {

                        var lat = results[0].geometry.location.lat();
                        var lng = results[0].geometry.location.lng();

                        $scope.map = {
                            center: {latitude: lat, longitude: lng},
                            zoom: 15
                        };

                        $scope.marker = {
                            id: 0,
                            coords: {
                                latitude: lat,
                                longitude: lng
                            }
                        };
                    } else {
                        console.log(status);
                    }
                }, 0);
            });

        });

    }

})();