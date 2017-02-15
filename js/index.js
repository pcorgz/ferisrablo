var MouseEstaPresionado = true;

function mouseDown() {
	MouseEstaPresionado = false;
}
function mouseUp() {
	MouseEstaPresionado = true;
}

function crear_punto(grosorLinea,Color,CoordX,CoordY){

	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");

	//pintado de la nueva posicion
	if (MouseEstaPresionado){ ctx.beginPath(); }
		ctx.lineWidth=grosorLinea;
		ctx.strokeStyle=Color;
		ctx.rect(CoordX-5,CoordY-5, 10, 10);
		ctx.stroke();
}

function randColor(){

	var colorFinal = "#";
	var cont = 0; 

	while (cont<6) {
		switch (Math.floor((Math.random() * 10))) {
			case 1: colorFinal = colorFinal+ "A"; cont ++; break;
			case 2: colorFinal = colorFinal+ "B"; cont ++; break;
			case 3: colorFinal = colorFinal+ "C"; cont ++; break;
			case 4: colorFinal = colorFinal+ "D"; cont ++; break;
			case 5: colorFinal = colorFinal+ "E"; cont ++; break;
			case 6: colorFinal = colorFinal+ "F"; cont ++; break;
			case 7: colorFinal = colorFinal+ "0"; cont ++; break;
			//case 8: colorFinal = colorFinal+ "1"; cont ++; break;
			//case 9: colorFinal = colorFinal+ "2"; cont ++; break;

			default: break;
		}
	}
	return colorFinal;
}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: evt.clientX - rect.left,
		y: evt.clientY - rect.top
	};
}

function sigueme(event) {
	event = event || window.event;

	canvas = document.getElementById("myCanvas");
	var mousePos = getMousePos(canvas, event);

	
	//Capto las coordenads del puntero.
	var x = mousePos.x; // event.clientX;
	var y = mousePos.y; //event.clientY;

	//obtenemos tamaño de la ventana para dedimencionar el canvas
	//var w = window.innerWidth;
	//var h = window.innerHeight;

	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	var GrososLinea = "3";
	//limpiado del canvas
	ctx.clearRect(0, 0, c.width, c.height);
	crear_punto(GrososLinea,randColor(),(c.width/2)-(x-(c.width/2)),(c.height/2)-(y-(c.height/2)));
	crear_punto(GrososLinea,randColor(),x,y);
	crear_punto(GrososLinea,randColor(),y,x);
	crear_punto(GrososLinea,randColor(),(c.width/2)-(y-(c.width/2)),(c.height/2)-(x-(c.height/2)));
	crear_punto(GrososLinea,randColor(),x,(c.height/2)-(y-(c.height/2)));
	crear_punto(GrososLinea,randColor(),(c.width/2)-(x-(c.width/2)),y);
	crear_punto(GrososLinea,randColor(),y,(c.height/2)-(x-(c.height/2)));
	crear_punto(GrososLinea,randColor(),(c.width/2)-(y-(c.width/2)),x);
}