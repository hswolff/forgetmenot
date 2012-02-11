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


// Utility function for use in API
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


?>