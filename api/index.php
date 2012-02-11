<?php

require_once("database.php");

// Instantiate new API object
$api = new API;
// Execute API, passing in the request method
$api->exec($_SERVER['REQUEST_METHOD']);


class API {
	
	// Private PDO object
	private $db;

	public function __construct(){
		$this->db = new PDO(DATABASE_FILE);

	}
	
	// Switchboard, redirecting calls to appropriate functions
	public function exec($arg) {
		
		switch($arg)  {		

			case 'GET':
				$params = str_replace('/','',$_SERVER['QUERY_STRING']);
				parse_str($params, $params);
				$this->read($params);
				break;

			case 'PUT':
				parse_str(file_get_contents('php://input'), $p_data);			
				$object = json_decode(stripslashes($p_data['model']), true);			
				$this->update($object);
				break;

			case 'POST':
				$object = json_decode(stripslashes($_POST['model']), true);
				$this->create($object);
				break;

			case 'DELETE':
				$id = (int)str_replace('/','',$_SERVER['QUERY_STRING']);
				$this->delete($id);
				break;
		}
	}
	
	/*
	 * Object methods for:
	 *		C R U D
	 */

	public function create($object) {
		global $dataStructure;
		$columns = formatColumnsForPdo($dataStructure['todos']);
		// Original like:
		// "INSERT INTO todos (content, parent, indent, position, done) values (:content, :parent, :indent, :position, :done)"
		$stmt = $this->db->prepare("INSERT INTO todos ({$columns[0]}) values ({$columns[1]})");
		self::prepare($stmt, 'todos', $object);
		
		$stmt->execute();
		$object['id'] = (int)$this->db->lastInsertId();
		$db = null;
		
		return print_r(json_encode($object));
		
	}
	
	public function read($params = false) {
		if(isset($params['list']) || isset($params['model']['list'])) {
			$id = isset($params['list']) ? $params['list'] : $params['model']['list'];
			$rows = $this->db->prepare("SELECT * FROM todos WHERE list_id = $id");
		} else if(isset($params['todo'])) {
			$id = $params['todo'];
			$rows = $this->db->prepare("SELECT * FROM todos WHERE id = $id");
		} else if(isset($params['all'])) {
			$rows = $this->db->prepare("SELECT * FROM todos");
		} else {
			$id = 1;
			$rows = $this->db->prepare("SELECT * FROM todos WHERE list_id = 1");
		}
		$rows->execute();
		$todos = $rows->fetchAll(PDO::FETCH_ASSOC);
		/*
		if (isset($id)) {
			$todos = array(
				$id => $todos
			);
		}
		*/
		return print_r(json_encode($todos));
	}
	
	public function update($object) {
		$id = (int)$object['id'];

		global $dataStructure;
		$updateStatement = '';
		foreach ($dataStructure['todos'] as $name => $type) {
			if ($name != 'id') {
				$updateStatement .= $name.' = :'.$name.',';
			}
		}
		$updateStatement = substr($updateStatement, 0, -1);
		// Original like:
		// "UPDATE todos SET content = :content, parent = :parent, indent = :indent, position = :position, done = :done WHERE id = $id"
		$stmt = $this->db->prepare("UPDATE todos SET {$updateStatement} WHERE id = $id");

		self::prepare($stmt, 'todos', $object);
		$stmt->execute();
		$db = null;
		return print_r(json_encode($object));
		
	}
	
	public function delete($id) {
		// Original like: "DELETE FROM todos WHERE id = $id"
		$stmt = $this->db->prepare("DELETE FROM todos WHERE id = $id");
		$stmt->execute();
		$db = null;
	}
	
	/*
	 * Private functions for
	 * DB interactions
	 */
	
	static function prepare($stmt, $table, $row) {
		global $dataStructure;
		// Bind each column name to object passed in
		foreach ($dataStructure[$table] as $name => $type) {
			if ($name != 'id') {
				$stmt->bindParam($name, $row[$name]);
			}
		}
	}
	
}

?>