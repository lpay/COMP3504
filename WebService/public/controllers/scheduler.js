/**
 * Created by mark on 2/29/16.
 */

(function() {
    angular
        .module('app')
        .controller('SchedulerController', SchedulerController);

    function SchedulerController($scope, uiCalendarConfig) {
        $scope.title = "";
        $scope.currentView = "agendaWeek";
        $scope.currentMember = {};

        var currentIndex = 0;

        var updateTitle = function() {
            if (!uiCalendarConfig.calendars[currentIndex])
                return;

            var calendar = uiCalendarConfig.calendars[currentIndex].fullCalendar('getView');

            switch ($scope.currentView) {
                case 'month':
                    $scope.title = calendar.title;
                    break;

                case 'agendaDay':
                    $scope.title = calendar.title;
                    break;

                case 'agendaWeek':
                    $scope.title = calendar.title;
                    //$scope.title = calendar.start.format('MMMM Do') + ' - ' + calendar.end.format('MMMM Do, YYYY');
                    break;
            }
        };

        $scope.prev = function() {
            Object.keys(uiCalendarConfig.calendars).forEach(function(key) {
                uiCalendarConfig.calendars[key].fullCalendar('prev');
            });

            updateTitle();
        };

        $scope.next = function() {
            Object.keys(uiCalendarConfig.calendars).forEach(function(key) {
                uiCalendarConfig.calendars[key].fullCalendar('next');
            });

            updateTitle()
        };

        $scope.changeView = function(view) {
            Object.keys(uiCalendarConfig.calendars).forEach(function(key) {
                uiCalendarConfig.calendars[key].fullCalendar('changeView', view);
            });

            $scope.currentView = view;

            updateTitle();
        };

        $scope.prevMember = function() {
            if (currentIndex == 0)
                return;

            $scope.changeMember(--currentIndex);
        };

        $scope.nextMember = function() {
            if ($scope.currentGroup.members.length - 1 <= currentIndex)
                return;

            $scope.changeMember(++currentIndex);
        };

        $scope.changeMember = function(index) {
            $scope.$broadcast('OnChangeCover', index);
        };

        $scope.$on('OnCoverChange', function(event, index) {
            currentIndex = index;

            uiCalendarConfig.calendars[index].fullCalendar('render');

            $scope.currentMember = $scope.currentGroup.members[index];
            $scope.$apply();

            updateTitle();
        });
    }

})();