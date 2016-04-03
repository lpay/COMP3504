/**
 * Created by mark on April 2, 2016
 */
(function() {
    'use strict';

    angular
        .module('app')
        .directive('focus', function () {
            return {
                scope: {
                    focus: '='
                },
                link: function (scope, element) {
                    if (scope.focus) {
                        element.focus();
                    }
                }
            }
        });
})();