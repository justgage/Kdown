#Kdown
_Kyani download interface_

##Things to know
###bubpub
_bubpbub is a pub sub system with the twist that it uses the setTimout to make it non-blocking and a que that doesn't duplicate events._

##To Do
- Integrate search
- make individual file page


`Kdown` is the singleton that holds the whole program.

`$ui` is the jquery objects cache.

`view` holds actions for manipulating the DOM.

`db` is the main database that holds all the information about the aplication including the file list and the state of the page.

`kobj` is a costom object that validates the values it changes to, and publishes any changes with bubpub. 

`server` is what handles the AJAX calls to the server. 








