<?php

$db_name = 'sqlite:todo.db';

try {
	if (!file_exists(str_replace('sqlite:', '', $db_name))) {
		$db = new PDO($db_name);
		$db->exec("CREATE TABLE todos (id INTEGER PRIMARY KEY, content TEXT, parent INTEGER, indent INTEGER, order INTEGER, done INTEGER)");
		//$db->exec("INSERT INTO todos (content) values ('Your first todo is...')");
		print_r($db->errorInfo());
		$db->close();
		$db = null;
	}
}
catch(Exception $e) {
  die($e->getMessage());
}

$data = array();

try{

	switch($_SERVER['REQUEST_METHOD'])
	{			
		case 'GET':
			//print_r($_GET);
			ToDo::get($_GET);
			break;

		case 'POST':
			/* emulation method
			print_r(json_encode($_POST));
			print_r(json_decode(stripslashes($_POST['model'])));
			print_r($_POST['_method']);
			*/
			// Parse POST data...regular $_POST doesn't seem to work
			parse_str(file_get_contents('php://input'), $p_data);
			// POST data is returned and the key has the entire JSON
			// So we access just the key to get the JSON data
			$ak = array_keys($p_data);
			// Strip the extra slashes put in by PHP to make it 
			// A standard JSON object.
			// $data has our POST JSON object
			$data = stripslashes($ak[0]);
			// Decode the $data JSON object to an associative array
			$dataArray = json_decode($data, true);
			ToDo::create($dataArray);
			break;

		case 'PUT':
			parse_str(file_get_contents('php://input'), $p_data);
			$ak = array_keys($p_data);
			$data = stripslashes($ak[0]);
			//print_r($data);
			var_dump(json_decode($data, true));
			//ToDo::update($id);
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
		$rows = $db->prepare("SELECT * FROM todos");
		$rows->execute();
		$todos = $rows->fetchAll(PDO::FETCH_ASSOC);
		return print_r(json_encode($todos));
	}
	
	public static function create($todo) {
		global $db_name;
		$db = new PDO($db_name);
		print_r($todo);
		/*
		$content = 
		$parent = 
		$indent
		$position
		$done
		*/
		$db->prepare("INSERT INTO todos (content, parent, indent, position, done) values (:content, :parent, :indent, :position, :done)");
		$db->bindParam(':content', $content);
		$db->bindParam(':parent', $parent);
		$db->bindParam(':indent', $indent);
		$db->bindParam(':position', $position);
		$db->bindParam(':done', $done);
		$db->execute();
		
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