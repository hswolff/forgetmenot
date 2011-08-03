<?php

// PDO style DB name
define("DB_NAME", "sqlite:todo.db");

// If the db file doesn't exist create it!
// If it exists then carry on our merry way
try {
	if (!file_exists(str_replace('sqlite:', '', DB_NAME))) {
		$db = new PDO(DB_NAME);
		$db->exec("CREATE TABLE todos (id INTEGER PRIMARY KEY, content TEXT, parent INTEGER, indent INTEGER, position INTEGER, done INTEGER)");
		$db->close();
		$db = null;
	}
}
catch(Exception $e) {
  die($e->getMessage());
}


// Instantiate new API object
$api = new API;
// Execute API, passing in the request method
$api->exec($_SERVER['REQUEST_METHOD']);


class API {
	
	// Switchboard, redirecting calls to appropriate functions
	public function exec($arg) {
		
		switch($arg)  {		

			case 'GET':
				$id = str_replace('/','',$_SERVER['QUERY_STRING']);
				self::read($id);
				break;

			case 'PUT':
				parse_str(file_get_contents('php://input'), $p_data);			
				$dataArray = json_decode(stripslashes($p_data['model']), true);			
				self::update($dataArray);
				break;

			case 'POST':
				$dataArray = json_decode(stripslashes($_POST['model']), true);
				self::create($dataArray);
				break;

			case 'DELETE':
				$id = (int)str_replace('/','',$_SERVER['QUERY_STRING']);
				self::delete($id);
				break;
		}
	}
	
	public static function read($id = null) {
		global $db_name;
		$db = new PDO(DB_NAME);
		if($id == '') {
			$rows = $db->prepare("SELECT * FROM todos");
		} else {
			$rows = $db->prepare("SELECT * FROM todos WHERE id = $id");
		}
		
		$rows->execute();
		$todos = $rows->fetchAll(PDO::FETCH_ASSOC);
		return print_r(json_encode($todos));
	}
	
	public static function create($todo) {
		global $db_name;

		$db = new PDO(DB_NAME);		
		$stmt = $db->prepare("INSERT INTO todos (content, parent, indent, position, done) values (:content, :parent, :indent, :position, :done)");
		self::prepare($todo, $stmt);
		
		$stmt->execute();
		$todo['id'] = (int)$db->lastInsertId();
		$db = null;
		
		return print_r(json_encode($todo));
	}
	
	public static function update($todo) {
		global $db_name;
		$id = (int)$todo['id'];
		
		$db = new PDO(DB_NAME);
		$stmt = $db->prepare("UPDATE todos SET content = :content, parent = :parent, indent = :indent, position = :position, done = :done WHERE id = $id");

		self::prepare($todo, $stmt);
		$stmt->execute();
		$db = null;
		return print_r(json_encode($todo));
	}
	
	public static function delete($id) {
		global $db_name;

		$db = new PDO(DB_NAME);
		$stmt = $db->prepare("DELETE FROM todos WHERE id = $id");
		$stmt->execute();
		$db = null;

	}
	
	private function prepare($todo, $stmt) {
		$stmt->bindParam(':content', $todo['content']);
		$stmt->bindParam(':parent', $todo['parent']);
		$stmt->bindParam(':indent', $todo['indent']);
		$stmt->bindParam(':position', $todo['position']);
		$stmt->bindParam(':done', $todo['done']);
	}
	
}

?>