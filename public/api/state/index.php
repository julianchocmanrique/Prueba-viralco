<?php
declare(strict_types=1);

$root = dirname(__DIR__, 2);
$stateDir = $root . '/uploads/state';
$stateFile = $stateDir . '/app-state.json';

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

function app_default_state(): array {
  return [
    'version' => 1,
    'updatedAt' => '1970-01-01T00:00:00.000Z',
    'recentEvents' => [],
    'deletedEventIds' => [],
    'eventGalleries' => new stdClass(),
  ];
}

function safe_array($value, int $limit): array {
  return is_array($value) ? array_slice(array_values(array_filter($value)), 0, $limit) : [];
}

function read_state(string $stateFile): array {
  if (!is_file($stateFile)) return app_default_state();
  $decoded = json_decode((string) file_get_contents($stateFile), true);
  if (!is_array($decoded)) return app_default_state();
  return array_merge(app_default_state(), $decoded);
}

function sanitize_gallery_items($items): array {
  $result = [];
  foreach (safe_array($items, 120) as $item) {
    if (!is_array($item)) continue;
    $src = (string) ($item['publicUrl'] ?? $item['src'] ?? '');
    if ($src === '' || strpos($src, 'data:') === 0) continue;
    $result[] = [
      'id' => substr((string) ($item['id'] ?? ''), 0, 180),
      'eventId' => substr((string) ($item['eventId'] ?? ''), 0, 180),
      'operatorId' => substr((string) ($item['operatorId'] ?? 'admin'), 0, 80),
      'eventName' => substr((string) ($item['eventName'] ?? 'Evento Viralco'), 0, 160),
      'photoType' => substr((string) ($item['photoType'] ?? 'Foto'), 0, 120),
      'templateName' => substr((string) ($item['templateName'] ?? 'Plantilla'), 0, 120),
      'createdAt' => substr((string) ($item['createdAt'] ?? ''), 0, 80),
      'src' => substr($src, 0, 600),
      'publicUrl' => substr($src, 0, 600),
      'localUrl' => '',
      'frames' => (int) ($item['frames'] ?? 0),
    ];
  }
  return $result;
}

function sanitize_state(array $payload, array $current): array {
  $galleries = is_array($current['eventGalleries'] ?? null) ? $current['eventGalleries'] : [];
  if (is_array($payload['eventGalleries'] ?? null)) {
    foreach (array_slice($payload['eventGalleries'], 0, 300, true) as $key => $gallery) {
      if (!is_array($gallery)) continue;
      $galleryId = substr((string) ($gallery['id'] ?? $key), 0, 180);
      if ($galleryId === '') continue;
      $galleries[$galleryId] = [
        'id' => $galleryId,
        'eventName' => substr((string) ($gallery['eventName'] ?? 'Evento Viralco'), 0, 160),
        'operatorId' => substr((string) ($gallery['operatorId'] ?? 'admin'), 0, 80),
        'updatedAt' => substr((string) ($gallery['updatedAt'] ?? ''), 0, 80),
        'items' => sanitize_gallery_items($gallery['items'] ?? []),
      ];
    }
  }

  return [
    'version' => 1,
    'updatedAt' => gmdate('c'),
    'recentEvents' => safe_array($payload['recentEvents'] ?? ($current['recentEvents'] ?? []), 300),
    'deletedEventIds' => array_values(array_filter(array_map('strval', safe_array($payload['deletedEventIds'] ?? ($current['deletedEventIds'] ?? []), 300)))),
    'eventGalleries' => $galleries,
  ];
}

if (!is_dir($stateDir)) mkdir($stateDir, 0775, true);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
  echo json_encode(['ok' => true, 'state' => read_state($stateFile)], JSON_UNESCAPED_SLASHES);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $payload = json_decode((string) file_get_contents('php://input'), true);
  if (!is_array($payload)) $payload = [];
  $state = sanitize_state($payload, read_state($stateFile));
  $tmp = $stateFile . '.' . getmypid() . '.' . time() . '.tmp';
  file_put_contents($tmp, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
  rename($tmp, $stateFile);
  echo json_encode(['ok' => true, 'state' => $state], JSON_UNESCAPED_SLASHES);
  exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'error' => 'Método no permitido.']);
