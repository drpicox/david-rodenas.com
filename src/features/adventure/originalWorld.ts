import type { Item, Monster, Room } from "./World";

/**
 * The world of the 2007 adventure, word for word: the three text files the C
 * program read at start — `objetos.txt`, `monstruos.txt`, `habitaciones.txt`
 * — as data. The texts are in Spanish, as they were written for the class;
 * they are the game and are not translated. Row 0 is the south; north is
 * i + 1 and east is j + 1, as the original's move functions had it.
 *
 * One repair: the line for the bridge in the forest read `4636:gnomo del
 * puente`, which the C parser took for nothing, so the gnome — and with it
 * the key it drops — was never there and the game could not be finished.
 * Here the gnome is on its bridge.
 */
export const items: readonly Item[] = [
  {
    "name": "llave de laton",
    "kind": "key",
    "value": 111
  },
  {
    "name": "cristal magico",
    "kind": "key",
    "value": 1112
  },
  {
    "name": "llave de casa",
    "kind": "key",
    "value": 1314
  },
  {
    "name": "llave de la verja",
    "kind": "key",
    "value": 2636
  },
  {
    "name": "llave del puente",
    "kind": "key",
    "value": 3444
  },
  {
    "name": "llave del gnomo",
    "kind": "key",
    "value": 4636
  },
  {
    "name": "barca",
    "kind": "key",
    "value": 3233
  },
  {
    "name": "llave de la despensa",
    "kind": "key",
    "value": 2010
  },
  {
    "name": "diario",
    "kind": "weapon",
    "value": 1
  },
  {
    "name": "matamoscas",
    "kind": "weapon",
    "value": 2
  },
  {
    "name": "espada de madera",
    "kind": "weapon",
    "value": 4
  },
  {
    "name": "espada",
    "kind": "weapon",
    "value": 8
  },
  {
    "name": "espada venenosa",
    "kind": "weapon",
    "value": 12
  },
  {
    "name": "Thurmei",
    "kind": "weapon",
    "value": 16
  },
  {
    "name": "camisa",
    "kind": "shield",
    "value": 2
  },
  {
    "name": "escudo de madera",
    "kind": "shield",
    "value": 4
  },
  {
    "name": "escudo de escamas",
    "kind": "shield",
    "value": 8
  },
  {
    "name": "escudo",
    "kind": "shield",
    "value": 12
  },
  {
    "name": "Rharmei",
    "kind": "shield",
    "value": 16
  },
  {
    "name": "caramelo",
    "kind": "food",
    "value": 2
  },
  {
    "name": "judia",
    "kind": "food",
    "value": 4
  },
  {
    "name": "manzana",
    "kind": "food",
    "value": 8
  },
  {
    "name": "naranja",
    "kind": "food",
    "value": 12
  },
  {
    "name": "pocima",
    "kind": "food",
    "value": 16
  }
];

export const monsters: readonly Monster[] = [
  {
    "name": "mosca acida",
    "attack": 4,
    "defence": 0,
    "drops": "cristal magico"
  },
  {
    "name": "mosca",
    "attack": 0,
    "defence": 0,
    "drops": "caramelo"
  },
  {
    "name": "mosquito",
    "attack": 2,
    "defence": 0,
    "drops": "matamoscas"
  },
  {
    "name": "polilla",
    "attack": 1,
    "defence": 1,
    "drops": "camisa"
  },
  {
    "name": "cucaracha",
    "attack": 1,
    "defence": 1,
    "drops": "llave de casa"
  },
  {
    "name": "raton",
    "attack": 2,
    "defence": 2,
    "drops": "judia"
  },
  {
    "name": "rana venenosa",
    "attack": 2,
    "defence": 1,
    "drops": "espada de madera"
  },
  {
    "name": "planta carnivora",
    "attack": 1,
    "defence": 3,
    "drops": "escudo de madera"
  },
  {
    "name": "raton salvaje",
    "attack": 3,
    "defence": 3,
    "drops": "llave de la verja"
  },
  {
    "name": "escorpion dorado",
    "attack": 12,
    "defence": 2,
    "drops": "espada venenosa"
  },
  {
    "name": "trucha",
    "attack": 3,
    "defence": 3,
    "drops": "manzana"
  },
  {
    "name": "trucha asesina",
    "attack": 4,
    "defence": 7,
    "drops": "escudo de escamas"
  },
  {
    "name": "minimonstruo aquatico",
    "attack": 8,
    "defence": 4,
    "drops": "llave del puente"
  },
  {
    "name": "lobo",
    "attack": 8,
    "defence": 6,
    "drops": "manzana"
  },
  {
    "name": "lobo asesino",
    "attack": 12,
    "defence": 7,
    "drops": "escudo"
  },
  {
    "name": "ogro",
    "attack": 6,
    "defence": 10,
    "drops": "naranja"
  },
  {
    "name": "gnomo de puente",
    "attack": 11,
    "defence": 11,
    "drops": "llave del gnomo"
  },
  {
    "name": "murcielago",
    "attack": 8,
    "defence": 8,
    "drops": "judia"
  },
  {
    "name": "aranya",
    "attack": 14,
    "defence": 4,
    "drops": "Thurmei"
  },
  {
    "name": "vampiro",
    "attack": 12,
    "defence": 13,
    "drops": "Rharmei"
  },
  {
    "name": "aranya gigante",
    "attack": 14,
    "defence": 14,
    "drops": "barca"
  },
  {
    "name": "monstruo aquatico enorme",
    "attack": 32,
    "defence": 15,
    "drops": "llave de la despensa"
  }
];

/** By "i,j". An exit is -1 for a wall, 0 for open, and otherwise the value of the key that opens it. */
export const rooms: Readonly<Record<string, Room>> = {
  "0,0": {
    "name": "Bienvenida",
    "exits": [
      -1,
      -1,
      0,
      -1
    ],
    "holds": "diario",
    "text": "Bienvenido a este juego de aventura. \nEsta es la habitacion de bienvenida, donde aprenderas a moverte. \nLos comandos son:\n 'norte',\n 'sur',\n 'este',\n 'oeste'. \nPrueba de ir a la siguiente habitacion al 'este', y volver al 'oeste'."
  },
  "0,1": {
    "name": "Usa las llaves",
    "exits": [
      111,
      -1,
      -1,
      0
    ],
    "holds": "llave de laton",
    "text": "En esta sala aprenderas a coger objetos y abrir puertas con llave. \nLos comandos son:\n 'coger',\n y los de movimiento.\nSi vas al norte directamente no podras, intentalo.\nDespues coge la llave ('coger') y ves hacia el norte."
  },
  "0,2": {
    "name": "Comedor sur",
    "exits": [
      0,
      -1,
      0,
      -1
    ],
    "holds": "mosca",
    "text": "Es el ala sur de tu comedor. La luz entra difusa desde la salita y\nlas sillas esperan a tus invitados."
  },
  "0,3": {
    "name": "Salita",
    "exits": [
      0,
      -1,
      -1,
      0
    ],
    "holds": "polilla",
    "text": "Es la salita de tu casa, la luz entra por la ventana y las cortinas\ndesdibujan el exterior. Puedes ver tu sillon, una mesita con un \ncandelabro y estanterias con varios libros."
  },
  "0,4": {
    "name": "Huerto de pepinos",
    "exits": [
      0,
      -1,
      0,
      -1
    ],
    "holds": "nada",
    "text": "Junto a la verja sur de tu granja tienes el huerto de pepinos. \nApenas levantan un dedo del suelo, pero ya te relames pensando\nen su sabor."
  },
  "0,5": {
    "name": "Huerto de tomates",
    "exits": [
      0,
      -1,
      0,
      0
    ],
    "holds": "nada",
    "text": "Junto a la verja sur de tu granja tienes el huerto de tomates. Aun\nestan verdes, pero parece que este anyo tendras muy buena cosecha."
  },
  "0,6": {
    "name": "Caminito",
    "exits": [
      -1,
      -1,
      0,
      0
    ],
    "holds": "nada",
    "text": "Un bonito caminito se alarga hacia el este, la parte mas alejada \nde tu granja."
  },
  "0,7": {
    "name": "Caminito",
    "exits": [
      0,
      -1,
      -1,
      0
    ],
    "holds": "planta carnivora",
    "text": "Es el fin de tu caminito, al norte tienes las plantaciones frutales.\nSiempre te gusta pasear en primavera y ver las flores."
  },
  "1,0": {
    "name": "Despensa",
    "exits": [
      0,
      -1,
      -1,
      -1
    ],
    "holds": "nada",
    "text": "Al fin has podido entrar en la despensa!\nAhora ya puedes empezar a preparar la comida para tus comensales.\nFELICIDADES!"
  },
  "1,1": {
    "name": "Aprende a atacar",
    "exits": [
      -1,
      0,
      1112,
      -1
    ],
    "holds": "mosca acida",
    "text": "Es hora de que aprendas a atacar a tus enemigos. Debes ir con cuidado\nya que ellos se defenderan.\nSolo hay un comando:\n 'atacar'.\nPara ello debes conseguir primero un arma. Busca una, cogela y ataca.\nCuando venzas podras continuar."
  },
  "1,2": {
    "name": "Comedor",
    "exits": [
      0,
      0,
      0,
      -1
    ],
    "holds": "nada",
    "text": "Estas en el comedor de tu casa, fuera hace un dia fantastico y\nesperas visita. Hoy tienes decidido preparar un buen banquete!\nLa entrada esta al oeste, la salita al sur, y la cocina al oeste."
  },
  "1,3": {
    "name": "Recibidor",
    "exits": [
      0,
      0,
      1314,
      0
    ],
    "holds": "mosca",
    "text": "Es un recibidor pequenyo pero acogedor. Esta decorado austeramente\npero dispone de colgarropas para dejar la chaqueta.\nDesde el puedes acceder directamente a la salita, al comedor y a la\ncocina."
  },
  "1,4": {
    "name": "Patio",
    "exits": [
      0,
      0,
      0,
      0
    ],
    "holds": "nada",
    "text": "Hace un dia esplendido y estas en el jardin de tu granja. Aqui puedes\nver varias flores que has plantado y una fuente. Te rodean varios \nhuertos y mas lejos al este tienes los frutales."
  },
  "1,5": {
    "name": "Huerto de Judias",
    "exits": [
      -1,
      0,
      -1,
      0
    ],
    "holds": "raton salvaje",
    "text": "Un bonito huerto de judias se abre delante de ti. Hace apenas unas\nsemanas que las plantaste, pero ya estan florecidas. El fuerte color\namarillo de las flores contrastan con el verde de las plantas."
  },
  "1,6": {
    "name": "Manzanos",
    "exits": [
      0,
      -1,
      0,
      -1
    ],
    "holds": "raton",
    "text": "Este es tu cultivo de manzanas. Este anyo las lluvias han sido \ngenerosas y tendras una buena cosecha. Hay ya alguna manzana, pero\na mayoria demasiado verdes."
  },
  "1,7": {
    "name": "Ciruelos",
    "exits": [
      0,
      0,
      -1,
      0
    ],
    "holds": "nada",
    "text": "Siempre te ha gustado esta parte de la granja. Los ciruelos tienen\nhojas rojas y le dan un aspecto muy fresco. El rio esta hacia el norte,\ny tu casa hacia el suroeste."
  },
  "2,0": {
    "name": "Banyo",
    "exits": [
      -1,
      2010,
      0,
      -1
    ],
    "holds": "mosca",
    "text": "Este es el banyo de tu casa. Es mas bien rustico pero funcional. La \nbanyera la compraste recientemente y al lado tienes bien ordenadas\nlas toallas. Al sur esta la despensa."
  },
  "2,1": {
    "name": "Habitacion",
    "exits": [
      -1,
      -1,
      0,
      0
    ],
    "holds": "mosquito",
    "text": "Es la habitacion donde duermes. Tienes una cama de madera trabajada,\ncon numerosas mantas que te protegen del frio, y un tocador donde \nguardas tu ropa. Dese la habitacion puedes acceder al comedor y al\nlavabo."
  },
  "2,2": {
    "name": "Comedor norte",
    "exits": [
      -1,
      0,
      0,
      0
    ],
    "holds": "nada",
    "text": "Es la parte norte de tu gran comedor. La mesa para la ocasion se \nextiende y todos los servicios estan en su sitio. Desde aqui puedes\nacceder a la cocina y a tu habitacion."
  },
  "2,3": {
    "name": "Cocina",
    "exits": [
      -1,
      0,
      -1,
      0
    ],
    "holds": "cucaracha",
    "text": "Esta es tu cocina. Estas contento con tu nuevo horno de lenya, cocina\na las mil maravillas. Tienes todo preparado para hacer la comida, \npero te faltan los ingredientes. Tendrias que recogerlos de la \ndespensa."
  },
  "2,4": {
    "name": "Huerto de calabazas",
    "exits": [
      -1,
      0,
      -1,
      -1
    ],
    "holds": "escorpion dorado",
    "text": "Este es tu huerto de calabazas. Apenas han empezado a crecer pero \ndependes de ellas para comer este otonyo. No puedes evitar pensar\nsi te has de llevar alguna a tus padres."
  },
  "2,5": {
    "name": "Naranjos",
    "exits": [
      -1,
      -1,
      0,
      -1
    ],
    "holds": "naranja",
    "text": "Aqui tienes uno de los cultivos mas sufridos. No sueles tener \ndemasiadas naranjas, pero te gustan demasiado. Su color y aroma\nte resultan estupendas."
  },
  "2,6": {
    "name": "Entrada",
    "exits": [
      2636,
      0,
      0,
      0
    ],
    "holds": "rana venenosa",
    "text": "Aqui esta la entrada norte de tu granja. La coronan dos magnificos \ncipreses y numerosos arbustos. La reja la sueles tener cerrada, \nnunca te ha gustado adentrarte en el bosque. Al norte esta el rio."
  },
  "2,7": {
    "name": "Nogal",
    "exits": [
      -1,
      0,
      -1,
      0
    ],
    "holds": "raton",
    "text": "Unos grandes nogales se extienden es este cultivo de tu granja. \nSon especialmente interesantes, porque, aunque su fruto no sea tan\nbueno como las manzanas, son resistentes y te permiten superar los\ninviernos."
  },
  "3,0": {
    "name": "Cueva",
    "exits": [
      0,
      -1,
      0,
      -1
    ],
    "holds": "murcielago",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "3,1": {
    "name": "Cueva",
    "exits": [
      0,
      -1,
      -1,
      0
    ],
    "holds": "nada",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "3,2": {
    "name": "Lago interno",
    "exits": [
      0,
      -1,
      3233,
      -1
    ],
    "holds": "nada",
    "text": "Un inmenso lago interior se abre delante tuyo. Esta oscuro y \napenas se ve bien, pero intuyes que algo se mueve al este. \nNecesitas una barca para ir al centro del lago."
  },
  "3,3": {
    "name": "Centro del lago",
    "exits": [
      -1,
      -1,
      -1,
      0
    ],
    "holds": "monstruo aquatico enorme",
    "text": "Estas en el centro del lago con una pequenya y fragil barca.\nEs hogar de Troildhem, un increible monstruo misterioso. \nYa habias visto otro igual antes, pero mas pequenyo.\nTroildhem tiene varios metros de altura, y una decena de \ntentaculos con hojos."
  },
  "3,4": {
    "name": "Rio salvaje",
    "exits": [
      3444,
      -1,
      0,
      -1
    ],
    "holds": "espada",
    "text": "Aqui el rio se hace mas salvaje, sin embargo hay un puente que \nte permite pasar con segurida a la otra orilla. El puente se debe\ndesbloquear con una llave para poder pasar."
  },
  "3,5": {
    "name": "Rio",
    "exits": [
      -1,
      -1,
      0,
      0
    ],
    "holds": "trucha asesina",
    "text": "Por aqui discurre el rio. No puedes cruzar, pero mas al oeste\nhay un puente."
  },
  "3,6": {
    "name": "Rio",
    "exits": [
      -1,
      0,
      0,
      0
    ],
    "holds": "nada",
    "text": "Tu granja va a parar a este rio. En el norte esta el bosque \nmisterioso pero no puedes cruzar por aqui."
  },
  "3,7": {
    "name": "Rio",
    "exits": [
      -1,
      -1,
      -1,
      0
    ],
    "holds": "minimonstruo aquatico",
    "text": "El rio se ensancha y sus aguas se tranquilizan, hay numerosos\npeces pero algo se remueve enre las aguas."
  },
  "4,0": {
    "name": "Cueva",
    "exits": [
      0,
      0,
      -1,
      -1
    ],
    "holds": "nada",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "4,1": {
    "name": "Cueva",
    "exits": [
      0,
      0,
      -1,
      -1
    ],
    "holds": "murcielago",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "4,2": {
    "name": "Cueva",
    "exits": [
      0,
      0,
      -1,
      -1
    ],
    "holds": "nada",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "4,3": {
    "name": "Bosque oscuro",
    "exits": [
      0,
      -1,
      -1,
      -1
    ],
    "holds": "lobo",
    "text": "A pesar de ser de dia apenas llega un apice de luz. Arbustos, \narboles y zarzas dificultan el paso. Algo se mueve en la \noscuridad."
  },
  "4,4": {
    "name": "Rio salvaje",
    "exits": [
      -1,
      0,
      0,
      -1
    ],
    "holds": "nada",
    "text": "La orilla norte del rio es lugubre. Se escuchan extranyos ruidos\ny se intuye una maldicion. Aqui esta el punte que cruza a la \norilla sur, el ambiente parece hostil e invita cruzarlo."
  },
  "4,5": {
    "name": "Rio oscuro",
    "exits": [
      -1,
      -1,
      0,
      0
    ],
    "holds": "trucha",
    "text": "El rio fluye bajo las rocas y raizes de los arboles del bosque.\nLos sonios del bosque se intensifican y te sientes vigilado."
  },
  "4,6": {
    "name": "Bosque tenebroso",
    "exits": [
      0,
      -1,
      -1,
      0
    ],
    "holds": "nada",
    "text": "Una brecha entre zarzas y arbustos te da la entrada al bosque\ntenebroso. La luz escasea y las sombras son amenazadoras."
  },
  "4,7": {
    "name": "Bosque oscuro",
    "exits": [
      0,
      -1,
      -1,
      -1
    ],
    "holds": "ogro",
    "text": "A pesar de ser de dia apenas llega un apice de luz. Arbustos, \narboles y zarzas dificultan el paso. Algo se mueve en la \noscuridad."
  },
  "5,0": {
    "name": "Cueva",
    "exits": [
      0,
      0,
      -1,
      -1
    ],
    "holds": "aranya gigante",
    "text": "Sigue el tunel de la cueva oscura y sombria. Una gran telaranya\ndificulta el paso hacia el sud. Un movimiento poco cuidadoso te\npodria hacer presa de ella."
  },
  "5,1": {
    "name": "Cueva",
    "exits": [
      -1,
      0,
      0,
      -1
    ],
    "holds": "nada",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "5,2": {
    "name": "Cueva",
    "exits": [
      -1,
      0,
      -1,
      0
    ],
    "holds": "vampiro",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas, y el rumor de agua se magnifica. Has de caminar con cuidado \npara no resbalar o tropezar."
  },
  "5,3": {
    "name": "Bosque sombrio",
    "exits": [
      0,
      0,
      -1,
      -1
    ],
    "holds": "nada",
    "text": "El bosque es oscuro y junto a ti has descubierto un gran pared \nde roca solida al oeste, probablemente la montanya."
  },
  "5,4": {
    "name": "Bosque humedo",
    "exits": [
      0,
      -1,
      0,
      -1
    ],
    "holds": "nada",
    "text": "La luz escasea entre las hojas de los arboles. Zarzas y arbustos\ndan paso a un pequenyo riachuelo. Algo se mueve en la oscuridad."
  },
  "5,5": {
    "name": "Bosque",
    "exits": [
      -1,
      -1,
      0,
      0
    ],
    "holds": "nada",
    "text": "El bosque se extiende oscuro y misterioso. La luz se desdibuja a\ntraves de las hojas. Se escuchan los ruidos de los animales y\nsus otros habitantes."
  },
  "5,6": {
    "name": "Claro del Bosque",
    "exits": [
      0,
      0,
      -1,
      0
    ],
    "holds": "nada",
    "text": "El bosque se extiende oscuro y misterioso. Estas en un pequenyo\nclaro del bosque donde se puede contemplar el cielo. Notas que\nel bosque esta agitado."
  },
  "5,7": {
    "name": "Bosque",
    "exits": [
      0,
      0,
      -1,
      -1
    ],
    "holds": "nada",
    "text": "El bosque se extiende oscuro y misterioso. La luz se desdibuja a\ntraves de las hojas. Se escuchan los ruidos de los animales y\nsus otros habitantes."
  },
  "6,0": {
    "name": "Cueva",
    "exits": [
      0,
      0,
      -1,
      -1
    ],
    "holds": "nada",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "6,1": {
    "name": "Cueva",
    "exits": [
      0,
      -1,
      0,
      -1
    ],
    "holds": "nada",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "6,2": {
    "name": "Cueva",
    "exits": [
      0,
      -1,
      -1,
      0
    ],
    "holds": "murcielago",
    "text": "Estas dentro de la cueva, es oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Intentas mirar\npero parece que no tiene fin."
  },
  "6,3": {
    "name": "Bosque sombrio",
    "exits": [
      0,
      0,
      0,
      -1
    ],
    "holds": "nada",
    "text": "El bosque es oscuro y junto a ti has descubierto un gran pared \nde roca solida al oeste, probablemente la montanya. Notas que la\nroca esta humeda, muy probablemente haya alguna cueva."
  },
  "6,4": {
    "name": "Puente del bosque",
    "exits": [
      0,
      0,
      -1,
      0
    ],
    "holds": "gnomo de puente",
    "text": "La luz escasea entre las hojas de los arboles. Zarzas y arbustos\ndan paso a un pequenyo riachuelo. Un puente cruza el riachuelo y\npermite alcanzar la parte este del bosque, alli, bajo un arbol\nhay la casa de un troll que tenras que atravesar si quieres ir\nal este."
  },
  "6,5": {
    "name": "Bosque oscuro",
    "exits": [
      -1,
      -1,
      0,
      -1
    ],
    "holds": "lobo asesino",
    "text": "A pesar de ser de dia apenas llega un apice de luz. Arbustos, \narboles y zarzas dificultan el paso. Algo se mueve en la \noscuridad."
  },
  "6,6": {
    "name": "Claro del Bosque",
    "exits": [
      -1,
      0,
      0,
      0
    ],
    "holds": "nada",
    "text": "El bosque se extiende oscuro, misterioso y agitado. Estas en un \npequenyo claro del bosque donde se puede contemplar el cielo."
  },
  "6,7": {
    "name": "Bosque",
    "exits": [
      0,
      0,
      -1,
      0
    ],
    "holds": "nada",
    "text": "En esta parte del bosque la luz empieza a escasear. Maranyas de\narbustos y zarzales dificultan tus pasos. Notas que algo se mueve\nentre las sombras."
  },
  "7,0": {
    "name": "Cueva",
    "exits": [
      -1,
      0,
      0,
      -1
    ],
    "holds": "nada",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "7,1": {
    "name": "Cueva",
    "exits": [
      -1,
      0,
      -1,
      0
    ],
    "holds": "aranya",
    "text": "Sigue el tunel de la cueva oscura y sombria. Las paredes estan \nhumedas y se escucha un rumor de agua a lo lejos. Has de caminar\ncon cuidado para no resbalar o tropezar."
  },
  "7,2": {
    "name": "Cueva",
    "exits": [
      -1,
      0,
      0,
      -1
    ],
    "holds": "nada",
    "text": "Estas en los primeros pasos dentro de la cueva. Aire frio y\nhumedo te invade de su interior. Intentas ver donde se acaba, \npero no puedes. Oyes murmullos provinientes de lo mas profundo."
  },
  "7,3": {
    "name": "Bosque",
    "exits": [
      -1,
      0,
      -1,
      0
    ],
    "holds": "nada",
    "text": "La luz escasea entre las hojas de los arboles. Un grupo de \nplantas trepadoras se mueven al oeste, es la entrada a una \ncueva. Sientes una presencia que te observa."
  },
  "7,4": {
    "name": "Bosque humedo",
    "exits": [
      -1,
      0,
      0,
      -1
    ],
    "holds": "nada",
    "text": "La luz escasea entre las hojas de los arboles. Zarzas y arbustos\ndan paso a un pequenyo riachuelo. Algo se mueve en la oscuridad."
  },
  "7,5": {
    "name": "Bosque",
    "exits": [
      -1,
      -1,
      0,
      0
    ],
    "holds": "lobo",
    "text": "El bosque se extiende oscuro y misterioso. La luz se desdibuja a\ntraves de las hojas. Se escuchan los ruidos de los animales y\nsus otros habitantes."
  },
  "7,6": {
    "name": "Bosque",
    "exits": [
      -1,
      -1,
      0,
      0
    ],
    "holds": "nada",
    "text": "El bosque se extiende oscuro y misterioso. La luz se desdibuja a\ntraves de las hojas. Se escuchan los ruidos de los animales y\nsus otros habitantes."
  },
  "7,7": {
    "name": "Bosque",
    "exits": [
      -1,
      0,
      -1,
      0
    ],
    "holds": "lobo",
    "text": "El bosque se extiende oscuro y misterioso. La luz se desdibuja a\ntraves de las hojas. Se escuchan los ruidos de los animales y\nsus otros habitantes."
  }
};
