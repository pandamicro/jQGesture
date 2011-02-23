var precx = -1, precy = -1;

function onclick(e) {
	$(':text').val(e.type+" "+e.target);
}

function ondclick(e) {
	$(':text').val(e.type+" "+e.target);
}

function onlclick(e) {
	$(':text').val(e.type+" "+e.target);
}

function draw(e) {
	var canvas = $('#canvasElem').get(0);
	var g2d = canvas.getContext('2d');
	
	g2d.beginPath();
	if(precx != -1) {
		g2d.moveTo(precx, precy);
		g2d.lineTo(e.offsetX, e.offsetY);
	}
	else g2d.moveTo(e.offsetX, e.offsetY);
	
	g2d.closePath();
	g2d.stroke();
	
	precx = e.offsetX;
	precy = e.offsetY;
}

function swipe(e) {
	$(':text').val(e.type+" "+e.target);
}

function keypressed(e) {
	debugMsgRefresh("");
	if(e.ctrlKey) 
		debugMsgAppend("Ctrl+");
	if(e.altKey) 
		debugMsgAppend("Alt+");
	if(e.shiftKey) 
		debugMsgAppend("Shift+");
		
	switch(e.keyCode) {
	case 13 :
		debugMsgAppend(" key: Enter code: "+e.keyCode);break;
	case 16 :
		debugMsgAppend(" key: Shift code: "+e.keyCode);break;
	case 17 :
		debugMsgAppend(" key: Ctrl code: "+e.keyCode);break;
	case 18 :
		debugMsgAppend(" key: Alt code: "+e.keyCode);break;
	case 32 :
		debugMsgAppend(" key: Space code: "+e.keyCode);break;
	case 37 :
		debugMsgAppend(" key: Left code: "+e.keyCode);break;
	case 38 :
		debugMsgAppend(" key: Up code: "+e.keyCode);break;
	case 39 :
		debugMsgAppend(" key: Right code: "+e.keyCode);break;
	case 40 :
		debugMsgAppend(" key: Down code: "+e.keyCode);break;
		
	default :
		debugMsgAppend(" key: " + String.fromCharCode(e.keyCode) + " code: "+e.keyCode);
		break;
	}
}