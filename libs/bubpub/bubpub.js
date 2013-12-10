var bubpub = {
    que : [],
    args : [],
    listeners : {},
    timeout_fired: false,

    /***
     * listen
     *
     * @desc Add a listener (or subscribe) to an event
     *
     * @arg {string} topic_str the event to listen to (namespaced by /'s)
     *          eg: "top_event"
     *          eg: "top_event/nested"
     */
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

    /***
     * say 
     *
     * @desc 'say' a new event (publish)
     *       which adds it to the que and makes a setTimout event to 
     *       fire the que (if one doesn't already exist needed).
     *
     * @arg {string} topic_str event to publish, 
     *                         see listen function above
     *
     * @arg {obj} args_obj this is an object that is passed to the listening event function.
     */
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
            }, 25); // allow to view to reflow. 
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
    /***
     * que_one
     *
     * @desc add an event to the que if it doesn't already exists.
     */
    que_one : function (i, event) {
        this.que[i] = this.que[i] || [];


        if ($.inArray(event, this.que[i]) === -1) {
            this.que[i].push(event);
            return true;
        }    
        return false;
    },

    /***
     * fire
     *
     * @desc fires all the events in the que.
     *
     * @arg {object} that a link to this object when called via setTimout made in the say function
     */
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
    },



    /***
     * @name bubpub.obj
     *
     * An object that publishes events when it changes
     *
     * also has ability to have a validator function passed
     * in to test if the input is valid or not.
     *
     * @arg {string} publish_name   a string of a publishing name that is pushed to bubpub.
     * @arg {any} preset            a value to set the object to when created.
     * @arg {funciton} validator    a function that will return TRUE if the value is valid.
     *
     * @return {function}           returns function for getting and setting the value.
     *
     * @constructor
     */
    obj : function (publish_name, preset, validator) {

        if (typeof preset === 'undefined') {
            preset = null;
        }
        if (typeof validator === 'undefined') {
            validator = null;
        }

        // save as a local var
        var value = preset;

        /***
         * Will change value to new_val 
         *  IF the values are different 
         *  AND it passes the validator function (if there is one)
         *
         * @arg {any} new_val value to try to change 'value' to.
         */
        var change = function (new_val) {

            // and is valid
            if (validator === null || validator(new_val) === true) {
                // make sure we're changing it
                if (value !== new_val) {
                    console.log('SET' ,value, '-> ' + publish_name + ' ->', new_val);
                    value = new_val;
                    bubpub.say(publish_name);
                    return true;
                }
            } else {
                console.error(publish_name, ' trying to set to ', new_val);
                return false;
            }
        };

        /***
         * function that will get/set the value.
         *      IF new_val is passed it SETS value.
         *      IF NOT it GETS value.
         *
         * @arg {any} new_val value to change 'value' to. 
         *
         * @return {any / bool} returns if the value was changed if it SETS
         *                           returns value if not set. 
         */
        return function kobj_get_set(new_val) {
            // GET
            if (typeof new_val === 'undefined') {
                if (value === null) {
                    console.error(publish_name + ' returning NULL');
                }
                return value; // get
            } else {
                // SET
                return change(new_val);
            }

        };
    }
};
