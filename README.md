#Kdown
_Kyani download interface_

##Things to know
###bubpub
_bubpbub is a pub sub system with the twist that it uses the setTimout to make it non-blocking and a que that doesn't duplicate events._
for more information see the bubpub repo. https://github.com/justgage/bubpub.js
###Terms
`cat` refers to the categories that files can be devided in. 
`market` is the kyani market (usually a country but not always).

##To Do
- make individual file page.
- test for ajax errors.
- fix bugs.

`Kdown` is the singleton that holds the whole program.

`$ui` is the jquery objects cache.

`view` holds actions for manipulating the DOM.

`db` is the main database that holds all the information about the aplication including the file list and the state of the page.

`kobj` is a costom object that validates the values it changes to, and publishes any changes with bubpub. 

`server` is what handles the AJAX calls to the server. 








