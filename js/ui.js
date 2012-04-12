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


	// Биндинг изменений настроек
	for(var k in d= ['login','password', 'instrument']){
		(function (name){
			$('#cil_'+name).val( readSettings(name) ).keyup(function(e){
				writeSetting(name, this.value )
				e.preventDefault()
				$('#user_label').html( $('#cil_login').val() + '/' + $('#cil_instrument').val() )
			})
		})(d[k])
	}
	// Номер телефона
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
		if( null !== num && !optionsScreen.is(':visible')){
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