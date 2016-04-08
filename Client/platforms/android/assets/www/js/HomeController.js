/**
 * Created by Liddy on 30-Mar-2016.
 */

app
  .controller('HomeController', function($scope, $stateParams, $http) {

    $scope.UpcomingAppoint = function() {

      $http.get('http://scheduleup.crazyirish.ca/appointments')
        .success(function(data) {
            console.log("Upcoming Appointments fetched");

            $scope.appointments = data;
            console.log($scope.appointments);
        })
        .error(function(err){

        });
    };

    $scope.UpcomingAppoint();

  });
