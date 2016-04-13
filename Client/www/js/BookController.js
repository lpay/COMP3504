/**
 * Created by Johnny on 3/22/2016.
 */

(function() {
    angular
        .module('app')
        .controller('BookController', BookController);

    function BookController($state, $scope, $stateParams, $http, $timeout, uiGmapGoogleMapApi) {
        $scope.group = $stateParams.group;
        $scope.timeslot = $stateParams.timeslot;

        $scope.book = function() {

            $http.post('http://localhost:3504/appointments', {
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

        uiGmapGoogleMapApi.then(function(maps) {
            var geocoder = new maps.Geocoder();

            var address = $scope.group.address + ' ' + $scope.group.city + ', ' + $scope.group.province + ' ' + $scope.group.postalCode;

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
