<?php

// Define Table Name
define("DATABASE_NAME", "todo");

$dataStructure = array(
	"todos" => array(
		/*
		'name' => 'column type'
		*/
		'id' => 'INTEGER PRIMARY KEY',
		'name' => 'TEXT', 
		'description' => 'TEXT', 
		'status' => 'INTEGER',
		'position' => 'INTEGER', 
		'parent_id' => 'INTEGER',	
		'list_id' => 'INTEGER'
	),
	"lists" => array(
		'id' => 'INTEGER PRIMARY KEY',
		'name' => 'TEXT',
		'status' => 'INTEGER',
		'position' => 'INTEGER',
	)
);

// Table Layout
$tableLayout = array(
	/*
	'name' => 'column type'
	*/
	'id' => 'INTEGER PRIMARY KEY',
	'content' => 'TEXT', 
	'status' => 'INTEGER',
	'order' => 'INTEGER', 
	'parent_id' => 'INTEGER',	
	'list_id' => 'INTEGER'
);

// PDO style DB name
define("DATABASE_FILE", "sqlite:".DATABASE_NAME.".db");

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
// content,status,order,parent_id,list_id
$tableColumns = substr($tableColumns, 0, -1);
// :content,:status,:order,:parent_id,:list_id
$pdoTableColumns = substr($pdoTableColumns, 0, -1);

function formatColumnsForPdo($columns) {
	$tableColumns = '';
	$pdoTableColumns = '';
	foreach ($columns as $name => $type) {
		// exclude column name of 'id'
		if ($name != 'id') {
			$tableColumns .= $name.',';
			$pdoTableColumns .= ':'.$name.',';
		}
	}
	// Return columns without trailing ,
	// content,status,order,parent_id,list_id
	$tableColumns = substr($tableColumns, 0, -1);
	// :content,:status,:order,:parent_id,:list_id
	$pdoTableColumns = substr($pdoTableColumns, 0, -1);
	return array($tableColumns, $pdoTableColumns);
}
$a = formatColumnsForPdo($dataStructure['todos']);
var_dump( $a[0] );
// die();

// If the db file doesn't exist create it!
// If it exists then carry on our merry way
try {
	if (!file_exists(DATABASE_NAME.".db")) {
		$db = new PDO(DATABASE_FILE);

		// Create tables
		foreach($dataStructure as $table => $layout) {
			// Format table columns for correct PDO statement
			$rows = '';
			foreach ($layout as $name => $type) {
				$rows .= $name.' '.$type.',';
			}
			$db->exec("CREATE TABLE ".$table." (".substr($rows, 0, -1).")");
		}

		// Create first list
		$columns = formatColumnsForPdo($dataStructure['lists']);
		$stmt = $db->prepare("INSERT INTO lists (".$columns[0].") values (".$columns[1].")");
		$row = array(
			'id' => 1,
			'name' => 'Default List',
			'status' => 0,
			'position' => 0,
		);
		API::prepare($stmt, 'lists', $row);
		$stmt->execute();

		// Create first Todo
		$columns = formatColumnsForPdo($dataStructure['todos']);
		$stmt = $db->prepare("INSERT INTO todos (".$columns[0].") values (".$columns[1].")");
		$row = array(
			'id' => 1,
			'name' => 'First Dummy Todo', 
			'description' => '', 
			'status' => 0,
			'position' => 0, 
			'parent_id' => 0,	
			'list_id' => 1
		);
		API::prepare($stmt, 'todos', $row);

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
		$this->db = new PDO(DATABASE_FILE);

	}
	
	// Switchboard, redirecting calls to appropriate functions
	public function exec($arg) {
		
		switch($arg)  {		

			case 'GET':
				$id = str_replace('/','',$_SERVER['QUERY_STRING']);
				$this->read($id);
				print_r($id);
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
		$stmt = $this->db->prepare("INSERT INTO ".DATABASE_NAME." ({$tableColumns}) values ({$pdoTableColumns})");
		self::prepare($object, $stmt);
		
		$stmt->execute();
		$object['id'] = (int)$this->db->lastInsertId();
		$db = null;
		
		return print_r(json_encode($object));
		
	}
	
	public function read($id = null, $list = 0) {

		if($id == '') {
			// Original like: "SELECT * FROM todos"
			$rows = $this->db->prepare("SELECT * FROM ".DATABASE_NAME);
		} else {
			// Original like: "SELECT * FROM todos WHERE id = $id"
			$rows = $this->db->prepare("SELECT * FROM ".DATABASE_NAME." WHERE id = $id");
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
		$stmt = $this->db->prepare("UPDATE ".DATABASE_NAME." SET {$updateStatement} WHERE id = $id");

		self::prepare($object, $stmt);
		$stmt->execute();
		$db = null;
		return print_r(json_encode($object));
		
	}
	
	public function delete($id) {
		// Original like: "DELETE FROM todos WHERE id = $id"
		$stmt = $this->db->prepare("DELETE FROM ".DATABASE_NAME." WHERE id = $id");
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