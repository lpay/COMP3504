/**
 *
 */

(function() {
    angular
        .module('app')
        .controller('GroupController', GroupController);

    function GroupController($http, $scope, $stateParams, uiGmapGoogleMapApi, ionicDatePicker) {
        $scope.group = $stateParams.group;
        $scope.date = moment().startOf('day').toDate();

        $scope.min = $scope.date;
        $scope.max = moment($scope.date).add(1, 'years').toDate();

        $scope.filter = {
            member: '',
            type: '',
            time: ''
        };

        uiGmapGoogleMapApi.then(function(maps) {
            var geocoder = new maps.Geocoder();

            var address = $scope.group.address + ' ' + $scope.group.city + ', ' + $scope.group.province + ' ' + $scope.group.postalCode;

            geocoder.geocode({address: address}, function(results, status) {

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
            });
            
        });

        $scope.prev = function() {
            var date = moment($scope.date).subtract(1, 'days').toDate();

            if (date >= $scope.min)
                $scope.date = date;
        };

        $scope.next = function() {
            var date = moment($scope.date).add(1, 'days').toDate();

            if (date <= $scope.max)
                $scope.date = date;
        };

        $scope.selectDate = function(){
            ionicDatePicker.openDatePicker({
                callback: function (date) {
                    $scope.date = new Date(date);
                },
                from: $scope.min,
                to: $scope.max,
                inputDate: $scope.date,
                closeOnSelect: true,
                templateType: 'popup'
            });
        };

        $scope.$watch('date', function(newDate, oldDate) {
            $http.post('http://scheduleup.crazyirish.ca/appointments/search', {
                    group: $scope.group._id,
                    start: $scope.date
                })
                .success(function(timeslots) {
                    $scope.timeslots = timeslots;
                })
                .error(function(err) {

                });
        });

        $scope.$watch('filter', function(newFilter) { console.log(newFilter)});

        /*
        $scope.byTime = [];
        $scope.byType = [];

        var byType = {};
        var byTime = {};
        $scope.group.members.forEach(function (member){
            member.timeslots.forEach(function (timeslot){
                
                if (!byType[timeslot.title])
                    byType[timeslot.title] = [];

                byType[timeslot.title].push({
                    member: member.name,
                    start: timeslot.start,
                    end: timeslot.end,
                    title: timeslot.title
                });

                if (!byTime[timeslot.start])
                    byTime[timeslot.start] = [];

                byTime[timeslot.start].push({
                    member: member.name,
                    start: timeslot.start,
                    end: timeslot.end,
                    title: timeslot.title
                });
            })
        });

        Object.keys(byType).forEach(function(key) {
            $scope.byType.push({
                title: key,
                timeslots: byType[key]
            });
        });

        Object.keys(byTime).forEach(function(key) {
            $scope.byTime.push({
                time: key,
                timeslots: byTime[key]
            });
        });
        */
    }
})();

