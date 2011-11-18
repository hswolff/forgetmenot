<?php

// Define Table Name
define("TABLE_NAME", "todo");

// Table Layout
$tableLayout = array(
	/*
	'name' => 'column type'
	*/
	'id' => 'INTEGER PRIMARY KEY',
	'content' => 'TEXT', 
	'parent' => 'INTEGER', 
	'indent' => 'INTEGER', 
	'position' => 'INTEGER', 
	'done' => 'INTEGER'
);

// PDO style DB name
define("DB_NAME", "sqlite:".TABLE_NAME.".db");

// For use in API
// of format: 'content, parent, indent, position, done'
$tableColumns = '';
$pdoTableColumns = '';
foreach ($tableLayout as $name => $type) {
	// exclude column name of 'id'
	if ($name != 'id') {
		$tableColumns .= $name.',';
		$pdoTableColumns .= ':'.$name.',';
	}
}
$tableColumns = substr($tableColumns, 0, -1);
$pdoTableColumns = substr($pdoTableColumns, 0, -1);


// If the db file doesn't exist create it!
// If it exists then carry on our merry way
try {
	if (!file_exists(TABLE_NAME.".db")) {
		$db = new PDO(DB_NAME);
		// Format table for correct PDO statement
		$rows = '';
		foreach ($tableLayout as $name => $type) {
			$rows .= $name.' '.$type.',';
		}
		$db->exec("CREATE TABLE ".TABLE_NAME." (".substr($rows, 0, -1).")");
		// Enter First Default Row
		$stmt = $db->prepare("INSERT INTO ".TABLE_NAME." (".$tableColumns.") values (".$pdoTableColumns.")");
		$row = array(
			'content' => 'first dummy',
			'parent' => 0,
			'indent' => 0,
			'position' => 0,
			'done' => false
		);
		API::prepare($row, $stmt);
		$stmt->execute();
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
	
	// Private PDO object
	private $db;

	public function __construct(){
		$this->db = new PDO(DB_NAME);

	}
	
	// Switchboard, redirecting calls to appropriate functions
	public function exec($arg) {
		
		switch($arg)  {		

			case 'GET':
				$id = str_replace('/','',$_SERVER['QUERY_STRING']);
				$this->read($id);
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

		global $tableLayout, $tableColumns, $pdoTableColumns;
		// Original like:
		// "INSERT INTO todos (content, parent, indent, position, done) values (:content, :parent, :indent, :position, :done)"
		$stmt = $this->db->prepare("INSERT INTO ".TABLE_NAME." ({$tableColumns}) values ({$pdoTableColumns})");
		self::prepare($object, $stmt);
		
		$stmt->execute();
		$object['id'] = (int)$this->db->lastInsertId();
		$db = null;
		
		return print_r(json_encode($object));
		
	}
	
	public function read($id = null, $list = 1) {

		if($id == '') {
			// Original like: "SELECT * FROM todos"
			$rows = $this->db->prepare("SELECT * FROM ".TABLE_NAME);
		} else {
			// Original like: "SELECT * FROM todos WHERE id = $id"
			$rows = $this->db->prepare("SELECT * FROM ".TABLE_NAME." WHERE id = $id");
		}
		
		$rows->execute();
		$todos = $rows->fetchAll(PDO::FETCH_ASSOC);
		return print_r(json_encode($todos));
		
	}
	
	public function update($object) {
		$id = (int)$object['id'];

		global $tableLayout;
		$updateStatement = '';
		foreach ($tableLayout as $name => $type) {
			if ($name != 'id') {
				$updateStatement .= $name.' = :'.$name.',';
			}
		}
		$updateStatement = substr($updateStatement, 0, -1);
		// Original like:
		// "UPDATE todos SET content = :content, parent = :parent, indent = :indent, position = :position, done = :done WHERE id = $id"
		$stmt = $this->db->prepare("UPDATE ".TABLE_NAME." SET {$updateStatement} WHERE id = $id");

		self::prepare($object, $stmt);
		$stmt->execute();
		$db = null;
		return print_r(json_encode($object));
		
	}
	
	public function delete($id) {
		// Original like: "DELETE FROM todos WHERE id = $id"
		$stmt = $this->db->prepare("DELETE FROM ".TABLE_NAME." WHERE id = $id");
		$stmt->execute();
		$db = null;

	}
	
	/*
	 * Private functions for
	 * DB interactions
	 */
	
	static function prepare($object, $stmt) {
		global $tableLayout;
		// Bind each column name to object passed in
		foreach ($tableLayout as $name => $type) {
			if ($name != 'id') {
				$stmt->bindParam($name, $object[$name]);
			}
		}
	}
	
}

?>