#Kdown's structure docs
_This is the structure of the new application design. 
made with the idea that there really should only one way 
IN then one way OUT of the controllers _

#Model   

- db {}
    - market
        - current market
    - cat
        - current category
    - lang
        - current translation selected (can be 'ALL')
    - catList
        - list of valid categorys
    - marketList
        - list of valid markets
    - langList
        - list of valid markets
    - tableJson
        - hold the current table's JSON
    - page 
        - current page
    - json[market][cat]
        - saved json from the ajax querys
    - pastSearch[{"term" : list}, {}... to 5 entries]
        - a way to filter out the file list faster. 



- ModelHelper([ifLogging]); -> a ModelHelper object
    - log(T/F) -> if we should have log messages telling  the ins and outs of the database

    - getMarket(); -> market or false/console.error(if logging)
    - setMarket('valid market'); -> true or false (if it worked)

    - getCat(); -> cat or false
    - setCat('valid category'); -> true or false (if it worked)

    - getLang(); -> cat or false
    - setLang('valid lang'); -> true or false (if it worked)

    - getMarketList(); -> gets list of valid Market
    - getCatList(); -> gets list of valid Cats

    - getJson() -> get the straight up JSON from the server. 
    - getList(['market'], ['cat']); -> list of files in whatever is specified. 
    - getTable(['market'], ['cat']); -> same as above except in a array of table format
    - sort(tableJson, 'fileAttribute', [ifReverse]) -> 
    - filter('search string', tableJson) -> filter out results in the table 

#Controllers:
- router.js
    - this is a file that has funcitons to create events and fire them. 
- IO {}
    - start(JSON) 
        - load settings into the db
        - bind things to do the DOM
        - load the HASH and assign all the hash routes
        - make RouterTags for the different sianrious. 

    - in("Routertag") 
        - execute a list of commands based on a "TAG" from the dom
    - out()
        - update the DOM with the model's values
    - view {} 
        var page;                          // what page currently on
        var error = true / false           // if there's an error message;
        var errorText = "this is my error" // what error to display.
        display();

#Dom helpers
- Table {}
    - make(array('header', 'header2'), TableJSON) -> HTML shell with my (TAG) templating
    - display(TableJson) -> put TableJSON into the table. 
- CatList {}
    - display(catListJson) -> put the list of pages in the DOM
- marketDD {}
    - bind();
- TranslationDD {}
    - bind();

#View
- view{}
    - make();
        - ran on page load to set up the UI 
    - makePage(function () {})
        - makes a new code for making pages 
    - displayPage('type');
        - this is a function that takes all the model data and outputs it to the page based on the type
            hiding and showing the right dom elements. 

