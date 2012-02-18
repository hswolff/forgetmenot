<?php
// Users Array
// Each line follows the structure of:
//	'username' => 'password'
$users = array(
	'admin' => 'pass',
	'username' => 'password'
);

/*
 *  Uncomment the following
 *	To enable password protection
 */
/* // <== remove
session_start();
$_SESSION['auth'] = false;
if (authenticate($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW'])) {
	$_SESSION['auth'] = true;
	pass;
} else if (!isset($_SERVER['PHP_AUTH_USER']) || !$_SESSION['auth']) {
    header('WWW-Authenticate: Basic realm="Forgetmenot"');
    header('HTTP/1.0 401 Unauthorized');
    echo 'Wrong credentials!  Try again!';
    exit;
} else {
	echo 'Wrong credentials!  Try again!';
	exit;
}
function authenticate($user, $pass) {
	global $users;
	foreach ($users as $u => $p) {
		if($user == $u && $pass == $p) {
			return true;
		} else {
			return false;
		}
	}
}
*/ // <== remove
?>
<!doctype html>
<html lang="en">

<head>
  	<meta charset="UTF-8">
  	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="viewport" content="width=device-width, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">

  	<title>forgetmenot todo list | A Todo List for the common forgetful-but-not-me.</title>
    
    <link rel="stylesheet" href="css/forgetmenot.css?v=1"/>
    
    <link rel="stylesheet/less" href="css/less/forgetmenot.less"/>
    <script src="js/libs/less.js"></script>	
	
	<script data-main="js/main" src="js/libs/require.js"></script>
</head>
<body>

    <div class="container" id="app">
		<header>
	    	<h1>forgetmenot &weierp; todo list</h1>
			<img src="images/new.png" value="Create New" id="createNew" class="createNew" />
			
			<nav id="stats" class="clearfix">
				<!-- stats go here -->
			</nav>
		</header>
		
    	<ul class="todoList fmn-todos" id="todoItemsList">
    		<!-- #app items go here -->
    		<script type="text/javascript" id="todos">
    		var todos = <?php require_once('api.php'); ?>;
    		</script>
    	</ul>

    	<footer>
			
		</footer>
    </div>

</body>
</html>