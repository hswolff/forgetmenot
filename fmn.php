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
			$id = str_replace('/','',$_SERVER['QUERY_STRING']);
			ToDo::get($id);
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
			$dataArray = json_decode($data, true);
			ToDo::update($dataArray);
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
		if($id == '') {
			$rows = $db->prepare("SELECT * FROM todos");
		} else {
			$rows = $db->prepare("SELECT * FROM todos WHERE id = $id");
		}
		
		$rows->execute();
		$todos = $rows->fetchAll(PDO::FETCH_ASSOC);
		return print_r(json_encode($todos));
	}
	
	private function prepare($todo, $stmt) {
		$stmt->bindParam(':content', $todo['content']);
		$stmt->bindParam(':parent', $todo['parent']);
		$stmt->bindParam(':indent', $todo['indent']);
		$stmt->bindParam(':position', $todo['position']);
		$stmt->bindParam(':done', $todo['done']);
	}
	
	public static function create($todo) {
		global $db_name;

		$db = new PDO($db_name);		
		$stmt = $db->prepare("INSERT INTO todos (content, parent, indent, position, done) values (:content, :parent, :indent, :position, :done)");
		self::prepare($todo, $stmt);
		
		//$stmt->execute();
		$db = null;

		return print_r(json_encode($todo));
	}
	
	public static function update($todo) {
		global $db_name;
		$id = (int)$todo['id'];
		
		$db = new PDO($db_name);
		$stmt = $db->prepare("UPDATE todos SET content = :content, parent = :parent, indent = :indent, position = :position, done = :done WHERE id = $id");

		self::prepare($todo, $stmt);
		$stmt->execute();
		$db = null;
		return print_r(json_encode($todo));
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