/**
 * Created by mark on 2/18/16.
 */

app

    .service('UserService', function() {

        return {
            getProfile: function() {
                console.log('getProfile()');
            },

            getGroups: function() {
                console.log('getGroups()');
            }
        }
    });
