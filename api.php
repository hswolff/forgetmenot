<?php

require_once("api/database.php");
require_once("api/todo.php");

$todo = new Todo();

switch($_SERVER['REQUEST_METHOD'])  {		

	case 'GET':
		$params = str_replace('/','',$_SERVER['QUERY_STRING']);
		parse_str($params, $params);
		$todo->read($params);
		break;

	case 'PUT':
		parse_str(file_get_contents('php://input'), $p_data);			
		$object = json_decode(stripslashes($p_data['model']), true);			
		$todo->update($object);
		break;

	case 'POST':
		$object = json_decode(stripslashes($_POST['model']), true);
		$todo->create($object);
		break;

	case 'DELETE':
		$id = (int)str_replace('/','',$_SERVER['QUERY_STRING']);
		$todo->delete($id);
		break;
}

?>