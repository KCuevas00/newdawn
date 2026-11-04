<?php
// Receives the website's quote/contact form and emails it to the business.
// Requires PHP hosting (standard on cPanel/SiteGround/GoDaddy/Bluehost etc.).
$TO = 'info@newdawnscarpet.com';

header('Content-Type: application/json');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

// Honeypot: real visitors leave this empty; bots fill it in.
if (!empty($_POST['website'])) { echo '{"ok":true}'; exit; }

$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim($_POST['email'] ?? '');
$message = trim(strip_tags($_POST['message'] ?? ''));

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($message) > 5000) {
  http_response_code(400); echo '{"ok":false}'; exit;
}
// Block header injection
$name = str_replace(["\r", "\n"], ' ', $name);

$host    = preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'newdawnscarpet.com');
$subject = "New quote request from $name";
$body    = "Name: $name\nEmail: $email\n\n$message\n";
$headers = "From: website@$host\r\nReply-To: $email\r\nContent-Type: text/plain; charset=UTF-8\r\n";

if (mail($TO, $subject, $body, $headers)) { echo '{"ok":true}'; }
else { http_response_code(500); echo '{"ok":false}'; }
