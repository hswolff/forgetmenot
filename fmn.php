<?php

$id = $_GET['id'];
//echo $_SERVER['REQUEST_METHOD'];
try{

	switch($_GET['action'])
	{			
		case 'save':
			ToDo::save($id,$_GET['text']);
			break;

		case 'delete':
			ToDo::delete($id);
			break;
			
		case 'new':
			ToDo::createNew($_GET['text']);
			break;
	}

}
catch(Exception $e){
//	echo $e->getMessage();
	die("0");
}


$db_name = 'sqlite:todo.db';

try {
	if (!file_exists(str_replace('sqlite:', '', $db_name))) {
		$db = new PDO($db_name);
		$db->exec('CREATE TABLE todos (id INTEGER PRIMARY KEY, content TEXT, parent INTEGER, indent  INTEGER, order  INTEGER, done  INTEGER)');
		$db->exec("INSERT INTO todos (content) values ('Your first todo is...')");
		$db = null;
	}
}
catch(Exception $e) {
  die($error);
}


class ToDo {
	
	private $data;
	
	public function __construct($par){
		if(is_array($par))
			$this->data = $par;
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
	
	public static function save($id, $text) {
		global $db_name;
		$db = new PDO($db_name);
		$db->exec('UPDATE todos SET content = "'.$text.'", updated_at = datetime(\'now\',\'localtime\') WHERE id = '.$id.'');
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