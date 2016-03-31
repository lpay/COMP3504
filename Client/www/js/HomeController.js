/**
 * Created by Liddy on 30-Mar-2016.
 */

app
  .controller('HomeController', function($scope, $stateParams, $http) {

    $scope.UpcomingAppoint = function() {

      $http.get('http://localhost:3504/appointments')
        .success(function(data) {
            console.log("Upcoming Appointments fetched");
            console.log(data);
          $scope.groups = data;
        })
        .error(function(err){

        });
    };

    $scope.UpcomingAppoint();

  });
