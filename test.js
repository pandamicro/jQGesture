var os = BrowserDetect.OS;

var mobile = (os.indexOf("Mobile") >= 0);

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