/**
 *
 */

app.controller('GroupController', function($scope, $stateParams) {
    $scope.group = $stateParams.group;

    console.log($scope.group);
    console.log($scope.group.members);

    $scope.byTime = [];
    $scope.byType = [];

    var byType = {};
    var byTime = {};

      $scope.group.members.forEach(function (member){
      member.timeslots.forEach(function (timeslot){


        if (!byType[timeslot.title])
          byType[timeslot.title] = [];

        byType[timeslot.title].push({
          member: member.name,
          start: timeslot.start,
          end: timeslot.end,
          title: timeslot.title
        });

        if (!byTime[timeslot.start])
          byTime[timeslot.start] = [];

        byTime[timeslot.start].push({
          member: member.name,
          start: timeslot.start,
          end: timeslot.end,
          title: timeslot.title
        });
      })
    });

    Object.keys(byType).forEach(function(key) {
      $scope.byType.push({
        title: key,
        timeslots: byType[key]
      });
    });

    Object.keys(byTime).forEach(function(key) {
      $scope.byTime.push({
        time: key,
        timeslots: byTime[key]
      });
    });

    console.log($scope.byTime, $scope.byType);

});
