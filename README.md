#Kdown
_Kyani download interface_

Created: December 2013
By:      Gage Peterson (@justgage on github / twitter)

__status__: Beta.

__To Do__
- make individual file page.
- test for ajax errors.

#How-to


##Where is everything located?
- `kdown.js` the place where the bulk of the application is held
- `index.php` the main page that includes all the javascript librarys that is needed and kdown.js.
- `api.php` my mock api for looking up files.
- `console_fix.js` fixes the console errors in IE.
- `dl.css` some styles needed for the page (including css3 animations for sidebar / search bar.)
- `libs/` all the JS librarys are held.
    - `libs/bubpub/bubpub.js` JavaScript library for pubsubish system. <https://github.com/justgage/bubpub.js>
- `files/` all additional files like images and some json files.
- `files/market_lang.json` this is a standardised way (stole form front website) to associate the name of a market / language with it's locale code.

#Terms
- `cat` refers to the categories in the left hand tabs.
- `market` is the Kyani market (usually a country but not always).

#How is the application structured?

The downloads page is made of different parts.

- __API__ - this is the object that works with the API.
- __Hash__ - This deals with the hash in the URL. 

- __Page__ - anything that relates to the view
    - __Sidebar__ - The place at the left where the categories are held and the "all categories / search link." This is handled by the `page.sidebar` object.
    - __Main__ - the center part of the page that's usually occupied by the table but also home to messages such as "no files are found" and such. 
        - `table_normal` this is the normal category view of the table. 
        - `table_search` this is another table that is filtered when there's a search term. 
        - `none_found` a message saying there's no files found in a category (displayed when the `table_normal` is passed a empty array)
        - `ajax` this is the Ajax error having a button that allows you to reload the page. 
    - __File__ Pane - this is the slide out drawer that is displayed when you click on a file's name in the table. 
    - __Search__ - this is the search bar and also houses the search text.
