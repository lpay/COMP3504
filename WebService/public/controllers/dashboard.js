/**
 * Created by mark on 2/6/16.
 *
 */

app.controller('DashboardController', function($scope) {

    $scope.nav = [
        { sref: 'calendar', label: 'Dashboard' },
        { sref: 'profile',label: 'Profile' },
        { sref: 'logout', label: 'Logout' }
    ];

});