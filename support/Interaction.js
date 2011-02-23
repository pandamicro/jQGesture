// Plugin jQuery of Interaction for MSEdition
// Ref: http://docs.jquery.com/Plugins/Authoring

var os = BrowserDetect.OS;
var mobile = (os.indexOf("Mobile") >= 0);
var browser = BrowserDetect.browser; // Chrome/Safari/Firefox/Opera/Explorer

(function( $ ){

var _pressTimer;
var dblClickTimeOut = 400;
var pressTime = 1000;
var swipeXSeuil = 70;
var swipeYSeuil = 30;

var _currentEvt;
var _listeners;

var eventsWeb = {

	click			: 'click',
	doubleClick		: 'dblclick',
	longPress		: 'mousedown mousemove mouseup',
	move			: 'mousemove',
	swipe			: 'mousedown mousemove mouseup',
	gestureSingle	: 'mousedown mousemove mouseup',
	keydown			: 'keydown',
	keypress		: 'keypress',
	keyup			: 'keyup'
};

var eventsMobile = {

	click			: 'click',
	doubleClick		: 'click',
	longPress		: 'taphold',
	move			: 'touchmove',
	swipe			: 'touchstart touchmove touchend',
	gestureSingle	: 'touchstart touchmove touchend'
};

var methods = {

	init : function( options ) {
		if( !$.data($(this), 'mselisteners') ) {
			var lis = new Array();
			$.data( $(this).get(0), 'mselisteners', lis );
			
			var status = new Array();
			status['pressed'] = false;
			status['clicked'] = false;
			$.data( $(this).get(0), 'mseEvtStatus', status );
		}
	},
    
    destroy : function() {
		return this.each(function(){
			$(this).unbind('.mseInteraction');
			$.removeData( $(this).get(0), 'mselisteners' );
			$.removeData( $(this).get(0), 'mseEvtStatus' );
		});
	},
	
	addListener : function(type, func, tag) {
		if( typeof(type) != 'string' && isNaN(type) )
			return false;
			
		// Events corresponds
		var evts;
		if(mobile) evts = eventsMobile;
		else evts = eventsWeb;
			
		if( evts[type] != null ) {
			var listeners = $.data( $(this).get(0), 'mselisteners' );
			
			// If not existe, define listeners
			if( !listeners ) {
				var lis = new Array();
				listeners = $.data( $(this).get(0), 'mselisteners', lis );
			}
			listeners[type] = func;
			
			// Bind event to delegate function 'analyse'
			// No need for spercial bind
			if( !mobile || (mobile && type !== 'move' && type !== 'swipe' && type !== 'gestureSingle') ) 
				$(this).bind(evts[type]+'.mseInteraction', analyse);
			else {
				var arr = evts[type].split(' ');
				for( var i=0; i < arr.length; i++ ) {
					$(this).get(0).addEventListener(arr[i], analyse, false);
				}
			}
		}
	},

};

function dblTimeOut() {
	if( _currentEvt )
		$.data( _currentEvt.target, 'mseEvtStatus')['clicked'] = false;
}

// All interaction needed is listened by this function, it will analyse all the event occured and propose the real event which is happenning
function analyse(e) {
	e.preventDefault();
	
	// Get listener list
	_listeners = $.data( $(this).get(0), 'mselisteners' );
	var status = $.data( $(this).get(0), 'mseEvtStatus');
	
	if(e.type === 'keypress') {
		var evt = e || window.event;
		evt.preventDefault();
		var event = new MseGestEvt(evt);
	}
	else var event = new MseGestEvt(e);
	
	switch( event.type ) {
	
	case 'click' :
		if( typeof(_listeners['click']) == 'function' ) {
			_listeners['click'].call( $(this), event );
		}
		if( typeof(_listeners['doubleClick']) == 'function' ) {
			// Detect the double click on mobile
			if(mobile) {
				// Already clicked
				if( status['clicked'] ) {
					event.type = 'doubleClick';
					_listeners['doubleClick'].call( $(this), event );
					status['clicked'] = false;
				}
				else {
					status['clicked'] = true;
					_target = event.target;
					setTimeout( // Time out, redefine clicked as false
						dblTimeOut, 
						dblClickTimeOut );
				}
			}
		}
		break;
	
	case 'dblclick' : 
		if( typeof(_listeners['doubleClick']) == 'function' )
			event.type = 'doubleClick';
			_listeners['doubleClick'].call( $(this), event );
		break;
	
// Mouse Events	
	case 'mousedown' : 
		gestureStart(e);
		break;
		
	case 'mousemove' :
		// Gesture Analyser add new point
		if(_currentEvt != null)
			gestureUpdate(e);

		if( typeof(_listeners['move']) == 'function' ) {
			event.type = 'move';
			_listeners['move'].call( $(this), event );
		}
		break;
		
	case 'mouseup' :
		// Gesture Analyser add new point
		if(_currentEvt != null)
			gestureEnd(e);
	
		break;
		
	
// Touch Events for iOS
	case 'taphold' :
		if( typeof(_listeners['longPress']) == 'function' ){
			event.type = 'longPress';
			_listeners['longPress'].call( $(this), event );
		}
		break;
		
	case 'touchstart' :
		gestureStart(e);
		//debugMsgRefresh(e.touches.length+" "+e.touches);
		break;
	
	case 'touchmove' :
		if(_currentEvt != null)
			gestureUpdate(e);
	
		if( e.touches.length === 1 && typeof(_listeners['move']) == 'function' ) {
			event.type = 'move';
			_listeners['move'].call( $(this), event );
		}
		break;
	
	case 'touchend' : 
		if( e.touches.length === 0 && _currentEvt != null )
			gestureEnd(e);
		break;
		
		
// Key Events Handling Generate a common result for all navigators
// Capable to handle normal key events and alt/shift pressed event(not implemented for ctrl)
// In Firefox, key 'enter' doesn't function in keypress events
	case 'keydown' :
	case 'keyup' :
	case 'keypress' :
		if( typeof(_listeners[event.type]) == 'function' )		
			_listeners[event.type].call( $(this), event );
		break;
		
	}
}

function pressTimeout() {
	if(_currentEvt) {
		_currentEvt.type = 'longPress';
		_listeners['longPress'].call( $(this), _currentEvt );
	}
}

function gestureStart(e) {
	// Gesture Analyser add start point
	_currentEvt = new MseGestEvt(e, true);
	_addPoint(e);
	
	if( typeof(_listeners['longPress']) == 'function' )
		_pressTimer = setTimeout( pressTimeout, pressTime );
}

function gestureUpdate(e) {
	_addPoint(e);
	
	if( typeof(_listeners['longPress']) == 'function' )
		clearTimeout(_pressTimer);
}

function gestureEnd(e) {
	// Long Press
	if( typeof(_listeners['longPress']) == 'function' )
		clearTimeout(_pressTimer);
		
	// Swipe
	if( typeof(_listeners['swipe']) == 'function' ) {
		// Init
		var maxY = _currentEvt.listY[0];
		var minY = _currentEvt.listY[0];
		var length = _currentEvt.listX.length;
		var validLeft = true, validRight = true;
		
		for(var i = 1; i < length; i++) {
			// Max and Min
			if(_currentEvt.listY[i] > maxY)
				maxY = _currentEvt.listY[i];
			if(_currentEvt.listY[i] < minY)
				minY = _currentEvt.listY[i];
			
			// Direction left
			if(validRight && _currentEvt.listX[i] < _currentEvt.listX[i-1]) {
				validRight = false;
				if(!validLeft) break;
			}
			// Direction right
			if(validLeft && _currentEvt.listX[i] > _currentEvt.listX[i-1]) {
				validLeft = false;
				if(!validRight) break;
			}
		}
		var dis = Math.abs(_currentEvt.listX[length-1] - _currentEvt.listX[0]);
		
		if(maxY-minY < swipeYSeuil && dis > swipeXSeuil) {
			if(validLeft) { // Swipe Left
				_currentEvt.type = 'swipeLeft';
				_listeners['swipe'].call( $(this), _currentEvt );
			}
			else if(validRight) { // Swipe Left
				_currentEvt.type = 'swipeRight';
				_listeners['swipe'].call( $(this), _currentEvt );
			}
		}
	}
	
	_currentEvt = null;
}

function _addPoint(e) {
	if( e.type.indexOf('mouse') >= 0 ) {
		// Web interacton with mouse or Android touch( TODO: correction )
		_currentEvt.listX.push(e.pageX - $(e.target).position().left);
		_currentEvt.listY.push(e.pageY - $(e.target).position().top);
	}
	else {
		// iOS interaction with touch
		var touch = e.touches[0]; // Get the information for finger #1
		_currentEvt.listX.push(touch.pageX - $(e.target).position().left);
		_currentEvt.listY.push(touch.pageY - $(e.target).position().top);
	}
}

$.fn.mseInteraction = function( method ) {

	if ( methods[method] ) {
		return methods[method].apply( this, Array.prototype.slice.call(arguments, 1));
	} else if ( typeof method === 'object' || ! method ) {
		return methods.init.apply( this, arguments );
	} else {
		$.error( 'Method ' +  method + ' does not exist on jQuery.mseInteraction' );
    }
	
};

})( jQuery );



function MseGestEvt( e, forAnalyse ) {
	this.target = e.target;
	
	// Event for analyser to analyse the gestures
	if(forAnalyse) this.type = 'temporary';
	else this.type = e.type;
	
	if(!mobile && e.type === 'mousemove') {
		this.offsetX = e.pageX - $(e.target).position().left;
		this.offsetY = e.pageY - $(e.target).position().top;
	}
	else if(e.type === 'touchmove') {
		var touch = e.touches[0]; // Get the information for finger #1
		this.offsetX = touch.pageX - $(e.target).position().left;
		this.offsetY = touch.pageY - $(e.target).position().top;
	}
	else {
		this.offsetX = e.pageX;
		this.offsetY = e.pageY;
	}
	
	if(forAnalyse) {
		this.listX = new Array();
		this.listY = new Array();
	}
	
	if(e.type === 'keydown' || e.type === 'keyup') {
		this.keyCode = e.keyCode;
		this.charCode = e.keyCode;
		this.altKey = e.altKey;
		this.ctrlKey = false;
		this.shiftKey = e.shiftKey;
	}
	if(e.type === 'keypress') {
		this.altKey = e.altKey==null ? false : e.altKey;
		this.ctrlKey = false;
		this.shiftKey = e.shiftKey==null ? false : e.shiftKey;
		
		if(browser === 'Firefox') {
			// key 'enter' doesn't function
			this.keyCode = e.charCode;
			this.charCode = e.charCode;
		}
		else {
			this.keyCode = e.keyCode;
			this.charCode = e.keyCode;
		}
	}
}