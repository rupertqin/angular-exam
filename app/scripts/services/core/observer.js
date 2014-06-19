'use strict';

angular.module('jxbFrontApp').service('Observer', [
    // dependence inject
    function() {

        this.subscribe = _subscribe;
        this.unsubscribe = _unsubscribe;
        this.publish = _publish;

        var channels = {};

        function _subscribe(topic, callback) {
            if (!_.isArray(channels[topic])) {
                    channels[topic] = [];
                }

            var handlers = channels[topic];
            handlers.push(callback);
        }

        function _unsubscribe(topic, callback) {
            if (_.isArray(channels[topic])) {
                var handlers = channels[topic];

                var index = _.indexOf(handlers, callback);
                if (index >= 0) {
                    handlers.splice(index, 1);
                }
            }
        }

        function _publish(topic, data) {
            var self = this;

            var handlers = channels[topic] || [];
            _.each(handlers, function(handler) {
                try {
                    handler.apply(self, [data]);
                } catch (ex) {
                    console.log(ex);
                }
            });
        }

    }
]);
