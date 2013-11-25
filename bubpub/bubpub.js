var bubpub = {
    que : [],
    args : [],
    listeners : {},
    timeout_fired: false,

    listen : function (topic_str, callback) {
        var topics = topic_str.split(" ");

        for (var i=0, l = topics.length; i < l; i++) {
            var topic = topics[i];

            // if it already exists
            if (!(topic in this.listeners)) {
                this.listeners[topic] = [];
            }

            if (typeof callback === "function" ) {
                this.listeners[topic].push(callback);
            } else {
                console.error("no callback function!");
            }

        }
    },
    say : function (topic_str, args_obj) {
        var topics = topic_str.split(" ");

        // merge the two objects together
        $.extend(this.args[topic_str], args_obj );

        console.groupCollapsed("SAY" , topics);

        for (var i=0, l = topics.length; i < l; i++) {
            this.bubble(topics[i]);
        }

        /***
         * deploy async fire if needed
         */
        if (this.timeout_fired === false) {
            this.timeout_fired = true;
            
            //needed for the 'this' problem
            var that = this;
            var fire = this.fire;
            setTimeout(function () {
                fire(that);
            }, 1); // IE doesn't like -> 0
        }
        console.groupEnd("SAY");
    },
    say_callback : function (topic_str, args_obj) {
        console.log("making callback", topic_str, args_obj);
        var that = this;
        return function (topic_str, args_obj) {
            that.say(topic_str, args_obj);
        };
    },
  
    /***
     * add's a event to each part of the que
     */
    bubble : function (topic) {
        var chain = topic.split("/");
        var i = chain.length;

        while(i--) {
            var event = chain.slice(0, i + 1).join("/");
            var worked = this.que_one(i ,event);
        }
    },
    // ques it only if it hasn't been qued
    que_one : function (i, event) {
        this.que[i] = this.que[i] || [];


        if ($.inArray(event, this.que[i]) === -1) {
            this.que[i].push(event);
            return true;
        }    
        return false;
    },
    // fires all the events in the que
    fire : function (that) {
        var que = that.que;
        that.que = [];
        that.timeout_fired = false;
        console.group("FIRE");

        i = que.length;

        // go through the que levels from the high to low
        //
        // a level is how deeply nested by slashes a thing is
        //  eg: base/middle/last... 
        //       ^-0   ^-1   ^-2
        // so the deepest nested things go first
        // and bubble up to the parents
        while(i--) {
            level = que[i]; 

            // each item on the level in order they where added
            for (var j=0, l = level.length; j < l; j++) {
                var item = level[j];

                // if there is anyone listening to that event
                if (item in that.listeners) {

                    // run all listeners attached to that event
                    for (var k=0, ll = that.listeners[item].length; k < ll; k++) {
                        
                        console.log("EVENT ->" , k, item);
                        // run each callback! passing args in the hash
                        that.listeners[item][k]( that.args[item] ); 
                    }

                }
            }
        }

        console.groupEnd("FIRE");
    }
};
