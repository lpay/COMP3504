
(function() {
    angular
        .module('app')
        .service('PushService', PushService);

    function PushService($http, $q, $ionicLoading) {
        var base_url = 'http://scheduleup.crazyirish.ca';

        function register(device_token){

            var deferred = $q.defer();

            $ionicLoading.show();

            $http.post(base_url + '/register', {'device_token': device_token})
                .success(function(response){
                    $ionicLoading.hide();
                    deferred.resolve(response);
                })
                .error(function(data){
                    deferred.reject();
                });


            return deferred.promise;

        }

        return {
            register: register
        };
    }
})();