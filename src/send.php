<?php


$r = json_decode(file_get_contents('php://input'), true);

$message = "COMANDA DEL WEB\n\n";
$message .= "NOM: ".$r["name"]."\n";
$message .= "CORREU ELECTRONIC: ".$r["email"]."\n";
$message .= "\n\n === Comanda: ONATIC.COM \n=======================";

$message .= "\n\n\n\n\n";
$message .= file_get_contents('php://input');

mail ( "david.rodenas@gmail.com","Tens una comanda per la web", $message );
/*
*/

header('Content-Type: application/json');
print json_encode("ok");

?>
