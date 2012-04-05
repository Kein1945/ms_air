var incommingCallUrl = 'http://test.plan.dellin.ru/call/incomming.html?number=%number%&device=%device%'

$(function(){
	/*$('#frame').attr('src','http://localhost:8080').load(function(){
		console.log($('#frame').contents().find('body').html());
	})*/
	/*var c = new Connection()
	$('#state').click(function(){
		if( $(this).hasClass('state_offline') ) {
			c.setLogin('bsalmanov')
			c.setPassword('123654')
			c.setInstrument('56704')
			c.setExtension('55555')
			c.connect('localhost', 8080)
			c.onConnectedListener(function(){
				if(this.isAuthorized()){
					$('#state').html('Authorized').addClass('state_online');
					State.setReady()
				} else {
					$('#state').html('Authorization fail').addClass('state_disconnected');
					State.setDisconnected()
				}
			})
		}
	})*/
	
})

function Quit() {
    var event = new air.Event(air.Event.EXITING, false, true);
    air.NativeApplication.nativeApplication.dispatchEvent(event);
    if (!event.isDefaultPrevented()) {
        air.NativeApplication.nativeApplication.exit();
    }
}

var cti
$(function(){
	Trace('Application started.')
	State.setOffline()
	var stateOnConnect = State.getStateByName('available').id
	if( typeof(console) == 'undefined' ){
		//cti = new Connection('192.168.14.159', 32562)
		cti = new Connection('127.0.0.1', 32562)
		cti.setLogin(readSettings('login'))//'bsalmanov')
		cti.setPassword( readSettings('password') )//'123654')
		cti.setInstrument( readSettings('instrument') )//'56704')
		cti.setExtension('5000')


		cti.addEventListener( cti.ON_AUTHORIZE, function(){
			cti.setState( stateOnConnect )
		})
		cti.addEventListener( cti.ON_AUTHORIZE_FAIL, function(e){
			State.setDisconnected( e.reason )
			ui.showAlert(e.reason)
		})
		cti.addEventListener( cti.ON_DISCONNECT, function(e){
			if( e.reason )
				State.setDisconnected( e.reason )
			else
				State.setOffline()
		})

		cti.addEventListener( cti.ON_WELCOME, function(){
			setTimeout(function(){
				Trace('Hello received. Trying to authroize...')
				cti.authorize()
			}, 500)
		})

		cti.addEventListener( cti.ON_STATE, function(e){
			switch(e.state){
				case State.getStateByName('available').id:
					State.setReady()
					ui.showMainScreen()
					break;
				case State.getStateByName('workReady').id:
				case State.getStateByName('notReady').id:
				case State.getStateByName('workNotReady').id:
					State.setBusy()
					ui.showMainScreen()
					break;
				case State.getStateByName('talking').id:
					State.setTalking()
					break;
				case State.getStateByName('reserved').id:
					State.setReserved()
					break;
				case State.getStateByName('login').id:
				case State.getStateByName('logout').id:
					State.setOffline()
					ui.showMainScreen()
					ui.showAlert('Please connect phone')
					cti.disconnect()
					break;
				default:
					State.setInfo( State.getStateById(e.state).label )
					break;
			}
			State.enable()
		})
		cti.addEventListener( cti.ON_ERROR, function(e){
			State.setDisconnected(e.reason)
		})

		cti.addEventListener( cti.ON_WARNING, function(e){
			//State.setInfo(e.reason)
			ui.showAlert(e.reason)
		})


		cti.addEventListener( cti.ON_CALLBEGIN, function(e){
			//Trace('Call event: d=' + e.device+' n='+e.number)
			ui.showDialScreen('Incomming call from <a href="'
				+ incommingCallUrl.replace('%device%', e.device).replace('%number%', e.number)
				+'" id="open_browser">'+e.number + '</a>')
		})

		State.setWait()
		cti.connect()
	}

	// State events listeners
	State.addEventListener( State.ON_OFFLINE, function(){
		State.setWait()
		cti.disconnect()
	})
	// State events listeners
	State.addEventListener( State.ON_CONNECT, function(){
		State.setWait()
		cti.connect()
		stateOnConnect = State.getStateByName('available').id
	})
	State.addEventListener( State.ON_READY, function(){
		State.setWait()
		cti.setState(State.getStateByName('available').id)
	})
	State.addEventListener( State.ON_BUSY, function(){
		State.setWait()
		if( !cti.isAuthorized() ){
			cti.connect()
			stateOnConnect = State.getStateByName('notReady').id
		} else {
			cti.setState(State.getStateByName('notReady').id)
		}
	})
	State.addEventListener( State.ON_STOP, function(){
		
	})
	State.addEventListener( State.ON_ANSWER, function(){
	})
	State.addEventListener( State.ON_REJECT, function(){
	})
	State.addEventListener( State.ON_CLEAR, function(){
	})
	State.addEventListener( State.ON_HOLD, function(){
		cti.send( new HoldPacket() )
	})
	State.addEventListener( State.ON_UNHOLD, function(){
	})
	// END State events listeners

	$('#clear_call').click(function(){
		cti.clearCall()
	})
	$('#open_browser').live('click', function(ev){
		var request = new air.URLRequest(this.href);
		try {
	 		air.navigateToURL(request);
		} catch (e) {
	    	air.Introspector.Console.log(e)
	    }
	    ev.preventDefault()
	})
})

var Trace = function(obj, className){
	className = className || ''
	className += ' btn'
	if( typeof(console) != 'undefined' ){
		console.log(obj)
	} else {
		if( className in ['in btn','out btn'])
			air.trace(((className=='in btn')?'|<<':'|>>')+'\t'+obj)
		else
			air.trace(obj)
	}
	if( 'string' == typeof(obj))
		$('#logs>div>div').prepend( $('<div/>').html(obj).addClass(className) )
}

$(function(){
	// docuyment.keypress - number dial
	$(document).keypress(function(e){
		if(e.ctrlKey && e.shiftKey){
			switch(e.keyCode){
				case 12: //  L
					$('#logs').modal('toggle')
					break;
				case 6: // F
					toggleWindowOnFront()
					break;
				case 20: //T
					break;
				case 18: //R
				default:
					Trace(e.keyCode)
			}
			
		}
	})
	/*$(document).keydown(function(e){ // Проблема что при наборе опций, все пишется в телефонное поле
		var num = null
		if( e.keyCode-96 < 10){
			num = e.keyCode - 96
		}
		if( e.keyCode-48 < 10 ){
			num = e.keyCode - 48
		}
		if( null !== num ){
			$('a.num'+num).addClass('active')
			ui.addNumToDialPhone(num)
		}
	})
	$(document).keyup(function(e){
		var num = null
		if( e.keyCode-96 < 10){
			num = e.keyCode - 96
		}
		if( e.keyCode-48 < 10 ){
			num = e.keyCode - 48
		}
		if( null !== num ){
			$('a.num'+num).removeClass('active')
		}
	})*/
	if( typeof(console) == 'undefined' ){
		toggleWindowOnFront()
	}
	updateUserLabel()
	// Trace(JSON.stringify( {name: 'biob'} ))
})

$(function(){
	for(var k in d= ['login','password', 'instrument']){
		(function (name){
			$('#cil_'+name).val( readSettings(name) ).keyup(function(e){
				writeSetting(name, this.value )
				e.preventDefault()
				cti['set' + (name.charAt(0).toUpperCase() + name.substr(1)) ] (this.value)
				updateUserLabel()
			})
		})(d[k])
	}
})
function updateUserLabel(){
	$('#user_label').html( $('#cil_login').val() + '/' + $('#cil_instrument').val() )
}

function writeSetting(key, value){
	var bytes = new air.ByteArray() //cil_instrument
	bytes.writeUTFBytes( value )
	air.EncryptedLocalStore.setItem(key, bytes)
}

function readSettings(key){
	var value = air.EncryptedLocalStore.getItem( key )
	return value ? value.readUTFBytes(value.length) : ''
}

function toggleWindowOnFront(){
	if( typeof(console) == 'undefined' ){
		for(var i =0; i<air.NativeApplication.nativeApplication.openedWindows.length; i++){
			var wnd =  air.NativeApplication.nativeApplication.openedWindows[i];
			wnd.alwaysInFront = !wnd.alwaysInFront;
			Trace("Toggle window in front")
		}
	}
}

$(function(){(function(){
	var mainScreen = $('#main')
		, optionsScreen = $('#options')
		, messageUp = $('#message-up')
			, messageUpText = $('#message-up div.alert p')
		, dialNumber = $('#dialinput')
			,dialNumInput = $('#dial_num input')
		, numpadArea = $('#numpad')
		, intalkArea = $('#intalk')
			,intalkTextArea = $('#intalk div.alert')
			,intalkStop = $('#clear_call')
	this.addNumToDialPhone = function(n){
		dialNumInput.val( dialNumInput.val()+n )
		dialNumInput.val( validatePhoneNum( dialNumInput.val() ) )
	}
	$('#numpad a.btn').click(function(){
		ui.addNumToDialPhone( $(this).html())
	})

	dialNumInput.keydown(function(e){ // Проблема что при наборе опций, все пишется в телефонное поле
		var num = null
		if( e.keyCode-96 < 10){
			num = e.keyCode - 96
		}
		if( e.keyCode-48 < 10 ){
			num = e.keyCode - 48
		}
		if( null !== num ){
			$('a.num'+num).addClass('active')
			dialNumInput.val( validatePhoneNum( dialNumInput.val() ) )
		}
	})
	dialNumInput.keyup(function(e){
		var num = null
		if( e.keyCode-96 < 10){
			num = e.keyCode - 96
		}
		if( e.keyCode-48 < 10 ){
			num = e.keyCode - 48
		}
		if( null !== num ){
			$('a.num'+num).removeClass('active')
		}
	})
	this.showMainScreen = function(){
		optionsScreen.hide()
		intalkArea.hide()
		messageUp.hide()
		numpadArea.show()
		dialNumber.show()
		mainScreen.show()
	}
	this.showAlert = function(text, className){
		messageUp.show()
		messageUpText.html( text )
	}
	this.showDialScreen = function(text, enabled){
		enabled = enabled || false
		dialNumber.hide()
		numpadArea.hide()
		messageUp.hide()
		intalkArea.show()
		intalkStop.toggle(enabled)
		intalkTextArea.html(text)
	}
	this.showOptionsScreen = function(){
		optionsScreen.show()
		mainScreen.hide()
	}
	messageUp.find('a.close').live('click', function(){
		messageUp.hide()
	})
	window['ui'] = this;
})()})

function validatePhoneNum(a){
	a = a.replace(/[^\d-\(\)]+/,'')
	return a.length<11?a:a.substr(0,11)
}