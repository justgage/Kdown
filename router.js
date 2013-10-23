/***
 * ROUTER.JS
 *
 * owner: Gage Peterson justgage@gmail.com
 *
 * licence -> MIT
 *
 * make_router
 *    returns an object with these functions
 *
 */
var make_router = function (debug) {
   var log = function (text) {
      if (debug) {
         klog(text);
      }
   };

   var err = function (text) {
      if (debug) {
         kerr(text);
      }
   };

   var hash_routes = [];
   var trigger_routes = [];

   var find = function (name, callback) {
      var route;
      var found = 0;

      var fireable = typeof callback === "function";

      for (i = 0, l = trigger_routes.length; i < l; i ++) {
         route = trigger_routes[i];
         if ( name === route.name ) {
            found++;
            if (fireable) {
               callback(route, trigger_routes, i);
            }
         }
      }

      for (i = 0, l = hash_routes.length; i < l; i ++) {
         route = hash_routes[i];
         if ( name === route.name ) {
            found++;
            if (fireable) {
               callback(route, hash_routes, i);
            }
         }
      }

      if (found > 0) { return true; } else { return false; }

   };

   $(window).bind('hashchange', function () {
      var hash = window.location.hash;
      var found = 0;
      var hash_array = hash.slice(1).split("@");
      var i = 0;

      for (i = 0, l = hash_routes.length; i < l; i ++) {
         var route = hash_routes[i];
         if (route.name === hash) {
            for (i = 0, l = route.event.length; i < l; i ++) {
               log(hash + " event Fired! (from hashchange)");
               route.event[i]();
            }
         }
      }
   });

   // Make return object
   return {
      add : function (route, callback) {
         if (typeof route === "string") {
            //is a hash route
            if (route[0] === "#") {
               if (find(route) === false) {
                  if (typeof callback === 'function') {
                     log("ADDED : " + route + "\t\tNO function");
                     hash_routes.push( { name: route , event : [callback] } );
                  } else {
                     log("ADDED : " + route + "\t\tWITH function");
                     hash_routes.push( { name: route , event : [] } );
                  }
               } else {
                  err("ERROR: route already exists, use listen -> route");
                  return  false;
               }
            }

            // not a hash route
            else {
               if (find(route) === false) {
                  if (typeof callback === 'function') {
                     trigger_routes.push( { name: route , event : [callback] } );
                  } else {
                     trigger_routes.push( { name: route , event : [] } );
                  }
               } else {
                  err("ERROR: route already exists, use listen -> " + route);
                  return  false;
               }
            }
            return  true;

            // bad input for route
         } else {
            log('ROUTE: bad input on add');
            log(route);
            log(callback);
            return false;
         }
      },
      //this will fire any event
      fire : function (route) {
         var trigger;
         var i = 0;
         var j = 0;

         log( 'FIRE: "' + route +  '"');

         var worked = find(route, function (route) {

            for (var i = 0, l = route.event.length; i < l; i ++) {
               log("   " + i + ": event fired");
               route.event[i]();
            }

            if (i === 0) {
               log("   route " + route.name + ' has no listeners');
            } else {
               if (route[0] === "#") {
                  window.location.hash = route;
               }
            }
         });

         if (worked === false) {
            err('   fire failed: event not found!');
         }

         return worked;
      },
      listen : function (name , callback) {
         log(name + " has new listener");
         return find(name, function (route) {
            route.event.push(callback);
         });
      },
      //this will get rid of a route
      remove : function (name) {
         find(name, function (route, list, i) {
            log("route " + route + " was removed");
            list.splice(i, 1);
         });
      },
      hashUpdate : function(hash){
         window.location.hash = hash;
      },
      //show all the routes (error checking)
      show : function () {
         var i = 0;
         var v;

         klog('hash_routes');
         if (hash_routes.length === 0) {
            klog("   ~~no routes~~");
         }
         else {
            for (i = 0, l = hash_routes.length; i < l; i ++) {
               klog("   " + hash_routes[i].name + " [" + hash_routes[i].event.length + "]" );
            }
         }

         klog('trigger_routes');
         if (trigger_routes.length === 0) {
            klog("   ~~no routes~~");
         }
         else {
            for (i = 0, l = trigger_routes.length; i < l; i ++) {
               klog("   " + trigger_routes[i].name + " [" + trigger_routes[i].event.length + "]" );
            }
         }
      }
   };
};


