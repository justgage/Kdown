BUBPUB.JS
=========
_a pubsub(ish) library that allows you to tie actions to events in a bubbling, non-duplicating, and non-blocking way._

__bubbling?__

Meaning if you call a child event every parent event gets called. 

eg: you call `parent/cool/child` then `parent`, `parent/cool` also get called.

__non-duplicating?__

This means when you publish an event __more that once__ it only gets called __one__ time when the que is emptied.

__non-blocking?__

also called 'async'. This means that the events don't publish till your code is done running


##Features:

 - "Talking objects" that publish events when the change.
 - Event que that doesn't duplicate or interrupt code.
 - Nesting (or name spacing) events that "bubble" up the chain when they are fired.

#Uses
__bubpub__ is great for updating the view because the events are non-duplicating they won't touch the DOM more than they need to. 

How it works:
=============
##Overview

1. __listen__ to a event with a callback.
2. __say__ (publish) a event which gets qued to fire async with setTimout.
3. __fire__ the que for all the callbacks listening to those events. 


###1. listen (subscribe)
_listen or subscribe to an event. This means the callback will fire anytime the event is fired_

```javascript
bubpub.listen({string} names, {function} callback)
```

```javascript
//listen to one event
bubpub.listen("rat", function () {...}); 

//listen to two events
bubpub.listen("dog cat", function () {...});  

//listen to a nested event
bubpub.listen("dog/bark", function () {...}); 

//listen to a different nested event
bubpub.listen("dog/sit", function () {...}); 

//listen to parent event which will fire on any of the following changes:
// 'dog'
// 'dog/bark'
// 'dog/sit'
bubpub.listen("dog", function () {...});
```

###2. say (publish)
_add an event to the que. that will fire all listening events._

```javascript
// adds "dog" and "dog/bark" to the que
bubpub.say("dog/bark");

// dog already exists on the que thus this is ignored.
bubpub.say("dog");

// this adds 'dob/sit' to the que but ignores 'dog'
bubpub.say("dog/sit");


// que is fired async in the following order
//
// fire: 'dog/bark'
// fire: 'dog/sit'
// fire: 'dog'
```

###Pulling it together. 

```javascript
bubpub.listen("people", function () {
    console.log("hello all people");
});

bubpub.listen("people/hi", function () {
    console.log("hi people");
});

bubpub.listen("people/spanish", function () {
    console.log("¡Hola people");
});

bubpub.say("people/hi people/hi people/spanish");

/***
 * console.log says: 
 *
 * hi people 
 * ¡Hola people 
 * hello all people
 */
```

###Talking objects
These are objects that have their own bubpub event that they fire whenever they change. 

they will not change in the following conditions

- the value is the same
- the value does not pass the validator function. (true = valid, false = invalid (don't change)) 


```javascript
var object = bubpub.obj('route/something', "start_value", validation_func);

var get_val = object(); // get value ("start_value")

object("cool"); // set value to "cool"

// listen to the changes to the object
bubpub.listen('route/something', function () {...});
```

##How the javascript event que works
bubpub is an async que which means that it piles up the que till the current code is done running then it allows a little time for the browser to redraw then emptys the que. 

__how the event system works__

- Any async event (setTimeout, click events, ajax calls, etc...) will never interupt code! they will just get pushed to the event que.
- the event que is what the browser fires after the current code is done and it's looking for somthing to do. 
- the browser window is only redrawn whenever there is _nothing_ on the event que. 
- setTimeout will que the event AFTER the timer minimum is passesd. Thus if you set the timer to more than 25ms then it allows time for the browser to redraw before adding new code to the que. 


#The que structure
```javascript
// adding base/mid/top
que = [
    0 : ["base"]
    1 : ["base/mid"]
    2 : ["base/mid/top"]
]
// adding base/mid/top again would provide no change
// 
// adding base/branch/top

que = [
    0 : ["base"]
    1 : ["base/mid", "base/branch"]
    2 : ["base/mid/top", "base/branch/top"]
]
```

### listener
````javascript
listeners = {
    "full": [ callback1, callback2, callback3, ...]
    "full/structure": [ callback1, ...]
}
````
