bubpub.js
=========
_a SubPub(ish) library, that avoids duplication on the cue,
because the view only needs to know once_

__STATUS:__ unstable!

##Features:
 - events don't duplicate or interupt code
 - Nesting pubs that "bubble" up the chain when they are fired
 - saying and listening to multiple events in a single call.

How it works:
=============

In it's simplist form,
````javascript

    bubpub.listen("people", function () {
        console.log("hello all people");
    });

    bubpub.listen("people/hi", function () {
        console.log("hi people");
    });

    bubpub.listen("people/spanish", function () {
        console.log("olah people");
    });

    bubpub.say("people/hi people/hi people/spanish");

    /***
     * console.log says: 
     *
     * hi people 
     * olah people 
     * hi all people
     */

````
__NOTE__  due to the async nature of "say" this does the same thing:



##format
### listener
````javascript
    listeners = {
        "full": [ callback1, callback2, callback3, ...]
        "full/structure": [ callback1, ...]
    }
````

## bubpub.listen
    split at " "
        -> each added to listeners

        each
            NOT exists? -> create
            add.

## bub.que
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

#$bub.fire
usually async! (unless called directly which is not recomended)
go through que backwards  from the leaves down to the root. 
