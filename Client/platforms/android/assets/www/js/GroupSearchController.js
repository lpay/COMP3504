/**
 * Created by Liddy on 03-Mar-2016.
 */

app.controller('GroupSearchController', function($scope, $http, $location, $auth) {

  $scope.groups = [];

  $scope.getGroups = function() {
    $http.get('http://scheduleup.crazyirish.ca/groups')
      .success(function (data) {
        console.log(data);
        $scope.names = data;
      })
      .error(function (err) {

      });
  };

  $scope.getGroups();

});
