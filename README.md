forgetmenot  (fmn)
===========

Clocking in at version 1.0 'cause it feels so good.

Goal
----
Forgetmenot is a self-hosted todo list application that is accessible via web and mobile browser.
Its datastore makes use of a SQLite database.
The end target for forgetmenot is to become *the* de facto self-hosted todo list application, just as (I would argue) WordPress is *the* de facto self-hosted blogging application.  

How to Install
----------------
1.  Download the [latest stable version](https://github.com/hswolff/forgetmenot/tarball/master)
2.  Extract all the files.
3.  Upload all the files to their own folder on your server.
4.  Open the folder on your web browser and start todo-ing!

### Add Basic Auth To Directory in 3 Easy Steps
1.  Open index.php in your favorite editor
2.  Edit the $users array to add your own user/pass combos
3.  Remove the comments to allow the PHP code to execute

Features
--------
*  Self-hosted (who wants to rely on a 3rd-party vendor?)
*  Accessible via modern web browser
*  Accessible via modern mobile browsers
*  Uses SQLite DB
*  Basic HTTP Auth to password protect your todos
*  Pretty to look at, pretty to use
	* [TODO] Skin-able
*  [TODO]  Folder/Sub-list Support
*  [TODO]  Meta-Information Available for each ToDo
	*  Notes
	*  URL
	*  Due Date
*  [TODO]  Multi-user accounts


Dependencies
------------
*  Backbone.js
*  Underscore.js
*  jQuery


Tested On
-----------
* Google Chrome (~v12+)
* Mozilla Firefox 3.6.18
* Mozilla Firefox 5.0.1
* Safari (5.1)
* Mobile Safari (iOS 4.2.9)


Credits
-------
Thank you Jérôme Gravel-Niquet for your great [ToDo List example application](http://documentcloud.github.com/backbone/examples/todos/index.html)
As well as Jeremy Ashkenas for the most excellent [Backbone.js](http://github.com/documentcloud/backbone/) and [Underscore.js](http://github.com/documentcloud/underscore/) libraries. 

