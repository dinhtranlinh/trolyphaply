<?php
/**
 * Prompt Manager API
 * Simple CRUD operations for JSON prompt files
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

$jsonDir = __DIR__ . '/Json/';

// Ensure Json directory exists
if (!is_dir($jsonDir)) {
    mkdir($jsonDir, 0777, true);
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'list':
        listPrompts();
        break;
    case 'read':
        readPrompt();
        break;
    case 'create':
        createPrompt();
        break;
    case 'update':
        updatePrompt();
        break;
    case 'delete':
        deletePrompt();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

/**
 * List all Full prompts (exclude P1, P2, etc.)
 */
function listPrompts() {
    global $jsonDir;
    
    $files = glob($jsonDir . '*-Full.txt');
    $prompts = [];
    
    foreach ($files as $file) {
        $basename = basename($file);
        $promptName = str_replace('-Full.txt', '', $basename);
        
        $content = file_get_contents($file);
        $json = json_decode($content, true);
        
        if ($json) {
            $prompts[] = [
                'name' => $promptName,
                'filename' => $basename,
                'title' => $json['common']['project_title'] ?? 'Untitled',
                'segments' => count($json['segments'] ?? []),
                'created' => filemtime($file),
                'size' => filesize($file)
            ];
        }
    }
    
    // Sort by created date (newest first)
    usort($prompts, function($a, $b) {
        return $b['created'] - $a['created'];
    });
    
    echo json_encode(['success' => true, 'prompts' => $prompts]);
}

/**
 * Read a prompt (Full or specific segment)
 */
function readPrompt() {
    global $jsonDir;
    
    $name = $_GET['name'] ?? '';
    $segment = $_GET['segment'] ?? 'Full';
    
    if (empty($name)) {
        echo json_encode(['error' => 'Prompt name required']);
        return;
    }
    
    $filename = $jsonDir . $name . '-' . $segment . '.txt';
    
    if (!file_exists($filename)) {
        echo json_encode(['error' => 'File not found']);
        return;
    }
    
    $content = file_get_contents($filename);
    $json = json_decode($content, true);
    
    if ($json === null) {
        echo json_encode(['error' => 'Invalid JSON']);
        return;
    }
    
    echo json_encode([
        'success' => true,
        'name' => $name,
        'segment' => $segment,
        'data' => $json,
        'raw' => $content
    ]);
}

/**
 * Create new prompt and auto-generate segment files
 */
function createPrompt() {
    global $jsonDir;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = $input['name'] ?? '';
    $jsonContent = $input['content'] ?? '';
    
    if (empty($name) || empty($jsonContent)) {
        echo json_encode(['error' => 'Name and content required']);
        return;
    }
    
    // Validate JSON
    $data = json_decode($jsonContent, true);
    if ($data === null) {
        echo json_encode(['error' => 'Invalid JSON format']);
        return;
    }
    
    // Validate structure
    if (!isset($data['common']) || !isset($data['segments'])) {
        echo json_encode(['error' => 'JSON must contain "common" and "segments"']);
        return;
    }
    
    if (!is_array($data['segments']) || empty($data['segments'])) {
        echo json_encode(['error' => 'Segments must be a non-empty array']);
        return;
    }
    
    // Check if already exists
    $fullFile = $jsonDir . $name . '-Full.txt';
    if (file_exists($fullFile)) {
        echo json_encode(['error' => 'Prompt already exists']);
        return;
    }
    
    // Save Full file
    file_put_contents($fullFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Generate segment files
    $segmentCount = count($data['segments']);
    for ($i = 0; $i < $segmentCount; $i++) {
        $segmentData = [
            'common' => $data['common'],
            'segments' => [$data['segments'][$i]]
        ];
        
        $segmentFile = $jsonDir . $name . '-P' . ($i + 1) . '.txt';
        file_put_contents($segmentFile, json_encode($segmentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Prompt created successfully',
        'files_created' => $segmentCount + 1
    ]);
}

/**
 * Update existing prompt and regenerate segment files
 */
function updatePrompt() {
    global $jsonDir;
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    $name = $input['name'] ?? '';
    $jsonContent = $input['content'] ?? '';
    
    if (empty($name) || empty($jsonContent)) {
        echo json_encode(['error' => 'Name and content required']);
        return;
    }
    
    // Validate JSON
    $data = json_decode($jsonContent, true);
    if ($data === null) {
        echo json_encode(['error' => 'Invalid JSON format']);
        return;
    }
    
    // Validate structure
    if (!isset($data['common']) || !isset($data['segments'])) {
        echo json_encode(['error' => 'JSON must contain "common" and "segments"']);
        return;
    }
    
    $fullFile = $jsonDir . $name . '-Full.txt';
    if (!file_exists($fullFile)) {
        echo json_encode(['error' => 'Prompt not found']);
        return;
    }
    
    // Delete old segment files
    $oldFiles = glob($jsonDir . $name . '-P*.txt');
    foreach ($oldFiles as $file) {
        unlink($file);
    }
    
    // Save Full file
    file_put_contents($fullFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    // Generate new segment files
    $segmentCount = count($data['segments']);
    for ($i = 0; $i < $segmentCount; $i++) {
        $segmentData = [
            'common' => $data['common'],
            'segments' => [$data['segments'][$i]]
        ];
        
        $segmentFile = $jsonDir . $name . '-P' . ($i + 1) . '.txt';
        file_put_contents($segmentFile, json_encode($segmentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Prompt updated successfully',
        'files_updated' => $segmentCount + 1
    ]);
}

/**
 * Delete prompt and all its segment files
 */
function deletePrompt() {
    global $jsonDir;
    
    $input = json_decode(file_get_contents('php://input'), true);
    $name = $input['name'] ?? '';
    
    if (empty($name)) {
        echo json_encode(['error' => 'Prompt name required']);
        return;
    }
    
    $fullFile = $jsonDir . $name . '-Full.txt';
    if (!file_exists($fullFile)) {
        echo json_encode(['error' => 'Prompt not found']);
        return;
    }
    
    // Delete Full file
    unlink($fullFile);
    
    // Delete all segment files
    $segmentFiles = glob($jsonDir . $name . '-P*.txt');
    $deletedCount = count($segmentFiles);
    foreach ($segmentFiles as $file) {
        unlink($file);
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Prompt deleted successfully',
        'files_deleted' => $deletedCount + 1
    ]);
}
