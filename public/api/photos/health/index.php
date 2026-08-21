<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('Access-Control-Allow-Origin: *');

echo json_encode([
  'ok' => true,
  'service' => 'viralco-photo-api',
  'storage' => '/uploads/photos',
], JSON_UNESCAPED_SLASHES);
