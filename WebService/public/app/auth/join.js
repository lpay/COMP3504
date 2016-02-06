/**
 * Created by mark on 2/4/16.
 *
 */

app.controller('GroupController', function($scope, $location, $http) {

    $scope.showCreate = false;

    $scope.create = function() {
        $http.post('/groups', $scope.group)
            .success(function() {
                $location.path('/dashboard');
            })
            .error(function(err) {
                console.log(err);
            });
    };

    $scope.join = function() {
        $http.post('/groups/join', { group: $scope.selectedGroup })
            .success(function() {
               $location.path('/dashboard');
            })
            .error(function(err) {
                console.log(err);
            });
    };

    $scope.selectize = {
        create: false,
        valueField: '_id',
        labelField: 'name',
        sortField: 'name',
        searchField: 'name',
        placeholder: 'search',
        options: [],
        maxItems: 1,
        render: {
            option: function(group, escape) {
                return [
                    '<div>',
                        '<div class="row">',
                            '<div class="col-md-7">',
                                escape(group.name),
                            '</div>',
                            '<div class="col-md-5 text-right">',
                                escape(group.city) + ', ' + escape(group.province),
                            '</div>',
                        '</div>',
                        '<div class="row">',
                            '<div class="col-md-8">',
                                escape(group.address),
                            '</div>',
                            '<div class="col-md-4 text-right">',
                                escape(group.postalCode),
                            '</div>',
                        '</div>',
                    '</div>'
                ].join('\n');
            }
        },
        load: function(query, callback) {

            if (!query.length)
                return callback();

            $http.get('/groups/' + encodeURIComponent(query))
                .success(function(groups) {
                    callback(groups);
                })
                .catch(function() {
                    callback();
                });
        }
    };
});
