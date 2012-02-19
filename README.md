forgetmenot - a todo list
===========

Forgetmenot is a self-hosted todo list application that is accessible via web and mobile browser.

Its datastore is a SQLite database, synching via a simple API written in PHP.

Features
--------
*  Self-hosted
*  Accessible via modern web browser (Google Chrome, Mozilla Firefox, etc.)
*  Accessible via modern mobile browsers (Mobile Safari, Browser, Opera, etc.)
*  SQLite DB
*  Basic HTTP Auth


Future Features
---------------
*  Multiple lists
*  Trash list for undos
*  Meta-information per todo (notes, url, due date, etc.)
*  Multi-user
*  Native iOS Application
*  Native Android Application


How it looks
--------------
![Preview Image](https://github.com/hswolff/forgetmenot/raw/master/screenshot.png)


Install
----------------
1.  Download the [latest stable version](https://github.com/hswolff/forgetmenot/tarball/master)
2.  Extract files and upload to your web server.
4.  Start not forgetting!

### Add Basic Auth To Directory in 3 Easy Steps
1.  Open index.php in your favorite editor
2.  Edit the $users array to add your own user/pass combos
3.  Remove the comments to allow the PHP code to execute


Libraries Used
------------
*  jQuery (1.7.1)
*  Underscore.js (1.3.1)
*  Backbone.js (0.9.1)
*  LESS (1.2.1)
*  require.js (1.0.6)


Development
--------
Forgetmenot requires [LESS](http://lesscss.org/#-server-side-usage) and [require.js](http://requirejs.org/docs/node.html#3) to be installed for development.  Once they are installed run the following two lines in the projects root directory to compile your production ready version of forgetmenot:
*  `lessc css/less/forgetmenot.less > css/forgetmenot.css`
*  `r.js -o js/main.build.js`

This will first compile your CSS files and then your JavaScript files.  It will create a build directory alongside your development directory named `forgetmenot-build`.


License
-------
MIT.  Have fun.