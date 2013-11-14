var pubsub = {
    que : [],
    bubble_que : [],
    bubble_hash : {},
    listeners : {},
    timeout_fired: false,

    listen : function (topic_str, callback) {
        // if it already exists
        if (!(topic_str in this.listeners)) {
            this.listeners[topic_str] = [];
        }

        if (typeof callback === "function" ) {
            this.listeners[topic_str].push(callback);
        } else {
            console.error("no callback function!");
        }
    },

    say : function (topic_str) {
        console.log("SAY");
        var topics = topic_str.split(" ");

        console.log("topics" , topics);

        for (var i=0, l = topics.length; i < l; i++) {
            this.bubble(topics[i]);
        }

        /***
         * deploy async fire if needed
         */
        if (this.timeout_fired === false) {
            this.timeout_fired = true;
            var that = this;
            setTimeout(function () {
              pubsub.fire(that); // NOT GOOD, BREAK ON GLOBAL
            }, 1); // IE doesn't like -> 0
        }
    },
    

    bubble : function (topic) {
        var chain = topic.split("/");
        var i = chain.length;
        console.log("chain", chain);

        // first one always fire
        this.que.push( chain.join("/") );

        console.log("event added",  this.que);

        // bubble other events
        while(--i) {
            var event = chain.slice(0, i).join("/");
            
            // combine bubbles
            if ( (event in this.bubble_hash) === false ) {
                this.bubble_que.push(event);
                this.bubble_hash[event] = true; // true doesn't matter
                console.log("bubble event added ->",  event);
            } else {
                console.log("bubble event skipped ->",  event);
            }
        }
    },

    fire : function (that) {
        console.error("FIRE");
        that.timeout_fired = false;

        var runEach = function (que, listeners) {
            var i, l, j, ll, item;

            for (i=0, l = que.length; i < l; i++) {
                item = que[i];

                if (item in listeners) {
                    for (j=0, ll = listeners[item].length; j < ll; j++) {
                        listeners[item][j](); // run callback
                    }
                }
            }
        };

        runEach(that.que, that.listeners);
        runEach(that.bubble_que, that.listeners);

        // clear all the ques
        that.que = [];
        that.bubble_que = [];
        that.bubble_hash = {};
    }
};


pubsub.listen("people", function () {
    console.log("hi all");
});

pubsub.listen("people/hi", function () {
    console.log("hi people");
});

pubsub.listen("people/spanish", function () {
    console.log("olah people");
});

pubsub.say("people/hi people/hi people/spanish");


pubsub.listen("people/spanish", function () {
    console.log("sorry I'm late!");
});

pubsub.say("people/hi people/hi people/spanish");
