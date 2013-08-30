<?php


$raw = "";
$raw .= "\n\n\n";
foreach ($_SERVER as $k => $v) {
  $raw .= "\nSERVER[$k]:$v";
}
$raw .= "\n\n\n";
foreach ($_REQUEST as $k => $v) {
  $raw .= "\nREQUEST[$k]:$v";
  $v = json_encode($v);
  $raw .= "\nREQUEST[$k]:$v";
}


$or = $_REQUEST['r'];
if (get_magic_quotes_gpc()) {
   $or = stripslashes($or);
}
$r = json_decode($or,true);
$r = $_REQUEST['r'];

$message = "COMANDA DEL WEB\n\n";
$message .= "NOM: ".$r["nom"]."\n";
$message .= "TELEFON FIX: ".$r["fixe"]."\n";
$message .= "TELEFON MOBIL: ".$r["mobil"]."\n";
$message .= "CORREU ELECTRONIC: ".$r["email"]."\n";
$message .= "ADRECA: \n--------\n".$r["adreca"]."\n----------------------\n";
$message .= "\n\n === Comanda\n=======================";

$message .= "\n\n\n\n\n".json_encode($_REQUEST['r']);;

$message .= $raw;

mail ( "david.rodenas@gmail.com","Tens una comanda per la web", $message );
/*
*/

header('Content-Type: application/json');
print json_encode("ok");

?>
