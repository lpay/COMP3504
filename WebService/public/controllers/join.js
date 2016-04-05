/**
 * Created by mark on 2/4/16.
 *
 */

(function() {
    
    angular
        .module('app')
        .controller('JoinController', JoinController);

    function JoinController($http, $scope, $state, $stateParams) {

        $scope.selectedGroup = null;
        $scope.createMode = $stateParams.createMode;
        $scope.currentGroup = $stateParams.currentGroup;

        $scope.createGroup = function() {
            $http.post('/groups', $scope.group)
                .success(function(group) {
                    $state.go('dashboard.scheduler', {group: group});
                })
                .error(function(err) {
                    console.log(err);
                });
        };

        $scope.joinGroup = function() {
            $http.post('/groups/join', { group: $scope.selectedGroup })
                .success(function(group) {
                    $state.go('dashboard.scheduler', {group: group});
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
                    ].join('');
                }
            },
            load: function(query, callback) {

                if (!query.length)
                    return callback();

                $http.get('/groups/search/' + encodeURIComponent(query))
                    .success(function(groups) {
                        callback(groups);
                    })
                    .catch(function() {
                        callback();
                    });
            }
        };
    }

})();