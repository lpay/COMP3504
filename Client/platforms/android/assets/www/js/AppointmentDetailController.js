/**
 * Created by Liddy on 02-Apr-2016.
 */

app.controller('AppointmentDetailController', function($scope, $stateParams) {

    $scope.appointment = $stateParams.appointment;

    console.log("Appointment details fetched");
    console.log($scope.appointment);

  });
