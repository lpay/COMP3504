/**
 * Created by mark on 2/4/16.
 *
 */

app.controller('GroupController', function($scope, $http) {

        $scope.groups = {};

        $scope.search = function(search) {
            $http.get('/groups/' + search)
                .success(function(data) {
                    $scope.groups = data;
                });
        }

    })

    .directive('groupSearch', function() {
        return {
            link: function($scope, element, attrs) {

            }
        }

    });
