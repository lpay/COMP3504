/**
 * Created by mark on April 3, 2016
 */

(function() {
    'use strict';

    angular
        .module('app')
        .directive('coverflow', CoverFlow);

    function CoverFlow($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element) {
                $timeout(function() {
                    element.coverflow({
                        easing: 'swing',
                        duration: 'slow',
                        visible: 'density',
                        //enableWheel: false,
                        index: scope.index || 0,
                        selectedCss: {opacity: 1},
                        outerCss: {opacity: 0.33},
                        select: function (event, cover, index) {
                            scope.$emit('OnCoverChange', index);
                        }
                    });
                }, 0);

                scope.$on('OnChangeCover', function(event, index) {
                    element.coverflow('index', index);
                });
            }
        };
    }

})();