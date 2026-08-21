<?php
declare(strict_types=1);

$root = dirname(__DIR__, 2);
$photosDir = $root . '/uploads/photos';
$publicBase = '/prueba-viralco/uploads/photos';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET,POST,OPTIONS');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  echo '{}';
  exit;
}

function absolute_url(string $path): string {
  $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
  $host = $_SERVER['HTTP_HOST'] ?? 'www.viralcoproducciones.com';
  return $scheme . '://' . $host . $path;
}

function safe_slug(string $value, string $fallback = 'evento'): string {
  $value = strtolower(trim($value));
  $value = preg_replace('/[^a-z0-9_-]+/', '-', $value) ?? '';
  $value = trim($value, '-');
  return $value !== '' ? substr($value, 0, 90) : $fallback;
}

function parse_data_url(string $dataUrl): ?array {
  if (!preg_match('/^data:image\/(png|jpe?g|webp);base64,(.+)$/i', $dataUrl, $matches)) return null;
  $extension = strtolower($matches[1]);
  if ($extension === 'jpeg') $extension = 'jpg';
  $data = base64_decode($matches[2], true);
  if ($data === false) return null;
  return ['extension' => $extension, 'data' => $data];
}

function read_photos(string $photosDir, string $publicBase): array {
  if (!is_dir($photosDir)) return [];
  $items = [];
  foreach (glob($photosDir . '/*/metadata.json') ?: [] as $metadataFile) {
    $metadata = json_decode((string) file_get_contents($metadataFile), true);
    if (!is_array($metadata)) continue;
    $dirName = basename(dirname($metadataFile));
    $url = (string) ($metadata['url'] ?? ($publicBase . '/' . $dirName . '/final.jpg'));
    $items[] = [
      'id' => (string) ($metadata['id'] ?? $dirName),
      'eventId' => (string) ($metadata['eventId'] ?? ''),
      'operatorId' => (string) ($metadata['operatorId'] ?? 'admin'),
      'eventName' => (string) ($metadata['eventName'] ?? 'Evento Viralco'),
      'photoType' => (string) ($metadata['photoType'] ?? 'Foto'),
      'templateName' => (string) ($metadata['templateName'] ?? 'Plantilla'),
      'createdAt' => (string) ($metadata['createdAt'] ?? ''),
      'url' => $url,
      'absoluteUrl' => absolute_url($url),
      'frames' => $metadata['frames'] ?? [],
    ];
  }
  usort($items, fn($a, $b) => strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? '')));
  return $items;
}

if (!is_dir($photosDir)) mkdir($photosDir, 0775, true);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(['ok' => true, 'photos' => read_photos($photosDir, $publicBase)], JSON_UNESCAPED_SLASHES);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $payload = json_decode((string) file_get_contents('php://input'), true);
  if (!is_array($payload)) $payload = [];

  $final = parse_data_url((string) ($payload['finalPhoto'] ?? ''));
  if (!$final) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Foto final inválida.']);
    exit;
  }

  $eventId = safe_slug((string) ($payload['eventId'] ?? 'evento'));
  $id = gmdate('Ymd-His') . '-' . substr(bin2hex(random_bytes(6)), 0, 12);
  $targetDir = $photosDir . '/' . $eventId . '-' . $id;
  mkdir($targetDir, 0775, true);

  $finalName = 'final.' . $final['extension'];
  file_put_contents($targetDir . '/' . $finalName, $final['data'], LOCK_EX);

  $savedFrames = [];
  $frames = is_array($payload['frames'] ?? null) ? array_slice($payload['frames'], 0, 12) : [];
  foreach ($frames as $index => $frame) {
    if (!is_array($frame)) continue;
    $parsed = parse_data_url((string) ($frame['src'] ?? ''));
    if (!$parsed) continue;
    $frameName = 'foto-' . ((int) $index + 1) . '.' . $parsed['extension'];
    file_put_contents($targetDir . '/' . $frameName, $parsed['data'], LOCK_EX);
    $frameUrl = $publicBase . '/' . basename($targetDir) . '/' . $frameName;
    $savedFrames[] = [
      'index' => (int) ($frame['index'] ?? $index),
      'url' => $frameUrl,
      'absoluteUrl' => absolute_url($frameUrl),
    ];
  }

  $url = $publicBase . '/' . basename($targetDir) . '/' . $finalName;
  $metadata = [
    'id' => basename($targetDir),
    'eventId' => (string) ($payload['eventId'] ?? $eventId),
    'operatorId' => (string) ($payload['operatorId'] ?? 'admin'),
    'eventName' => (string) ($payload['eventName'] ?? 'Evento Viralco'),
    'photoType' => (string) ($payload['photoType'] ?? 'Foto'),
    'templateName' => (string) ($payload['templateName'] ?? 'Plantilla'),
    'createdAt' => (string) ($payload['createdAt'] ?? gmdate('c')),
    'url' => $url,
    'absoluteUrl' => absolute_url($url),
    'frames' => $savedFrames,
  ];
  file_put_contents($targetDir . '/metadata.json', json_encode($metadata, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);

  echo json_encode(['ok' => true] + $metadata, JSON_UNESCAPED_SLASHES);
  exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
