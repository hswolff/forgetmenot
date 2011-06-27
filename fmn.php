<?php

$db_name = 'sqlite:todo.db';

try {
	if (!file_exists(str_replace('sqlite:', '', $db_name))) {
		$db = new PDO($db_name);
		$db->exec('CREATE TABLE todos (id INTEGER PRIMARY KEY, content TEXT)');
		$db->exec("INSERT INTO todos (content) values ('Your first todo is...')");
		print_r($db->errorInfo());
		$db->close();
		$db = null;
	}
}
catch(Exception $e) {
  die($e->getMessage());
}

$_PUT  = array();
if($_SERVER['REQUEST_METHOD'] == 'PUT') {
    parse_str(file_get_contents('php://input'), $_PUT);
}

try{

	switch($_SERVER['REQUEST_METHOD'])
	{			
		case 'GET':
			ToDo::get();
			break;

		case 'PUT':
			$id = str_replace('/', '', $_SERVER["QUERY_STRING"]);
			//print_r($_PUT);
			print_r(file_get_contents('php://input'));
			ToDo::update($id);
			break;
			
		case 'new':
			ToDo::createNew($_GET['text']);
			break;
	}

}
catch(Exception $e){
	echo $e->getMessage();
	die("0");
}



class ToDo {
	
	private $data;
	
	public function __construct($par){
		if(is_array($par))
			$this->data = $par;
	}
	
	public static function get($id = null) {
		global $db_name;
		$db = new PDO($db_name);
		$rows = $db->query('SELECT * FROM todos');
//		print_r($db->errorInfo());
		print_r(json_encode($rows->fetchAll(PDO::FETCH_ASSOC)));
//		die();
		return json_encode($rows->fetchAll(PDO::FETCH_ASSOC));
	}
	
	public static function createNew($text) {
		global $db_name;
		$db = new PDO($db_name);
		$db->exec("INSERT INTO todos (content, created_at, updated_at) values ('".$text."', datetime('now','localtime'), datetime('now','localtime'))");
		echo $db->lastInsertRowID();
		$db->close();
	}
	
	public function __toString() {
		return '
			<li id="todo-'.$this->data['id'].'" class="todo">'.$this->data['content'].'</li>
		';
	}
	
	public static function update($id, $text) {
		global $db_name;
		$db = new PDO($db_name);
		$db->exec('UPDATE todos SET content = "'.$text.'" WHERE id = '.$id.'');
		$db->close();
	}
	
	public static function delete($id) {
		global $db_name;
		$db = new PDO($db_name);
		$db->exec('DELETE FROM todos WHERE id = '.$id.'');
		$db->close();
	}
	
}


/*
$todos = array();
$db = new PDO($db_name);
$rows = $db->query('SELECT * FROM todos');
while ($row = $rows->fetch()) {
	$todos[] = new ToDo($row);
}
*/

?>