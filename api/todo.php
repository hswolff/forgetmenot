<?php


class Todo {

	// Properties of each todo object
	public $name;
	public $description;
	public $status;
	public $position;
	public $parent_id;
	public $list_id;

	
	// Private PDO object
	private $db;

	public function __construct($name = 'Name', $description = 'Description of todo', 
								$status = 0, $position = 0, $parent_id = 0, $list_id = 0){
		$this->__before();
	}

	private function __before() {
		// $this->db = new PDO('sqlite:../todo.db');
		$this->db = new PDO(DATABASE_FILE);
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
	
	public function read($id = false, $list_id = false, $status = false) {
		if ($id) {
			$rows = $this->db->prepare("SELECT * FROM todos WHERE id = $id");
		}
		else if ($list_id) {
			$rows = $this->db->prepare("SELECT * FROM todos WHERE list_id = $list_id");
		}
		else if ($status) {
			$rows = $this->db->prepare("SELECT * FROM todos WHERE status = $status");
		}
		else {
			$rows = $this->db->prepare("SELECT * FROM todos");
		}

		$rows->execute();
		$todos = $rows->fetchAll(PDO::FETCH_ASSOC);

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