/**
 * Created by Johnny Admin on 2/29/2016.
 */

app.controller('SearchController', function($scope, $http) {

  $scope.names = [];

  $scope.doSearch = function() {
    console.log('search');
    $http.get('http://localhost:3504/events/' + encodeURIComponent($scope.search))
      .success(function (data) {
        console.log(data);
        $scope.names = data;
      })
      .error(function (err) {

      });
  }
});
