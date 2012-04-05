var PROTOCOL_VERSION = 1
	, HELLO_PACKET = 1
	, WARNING_PACKET = 2
	, ERROR_PACKET = 3
	, AUTHORIZE_PACKET = 4
	, SETSTATE_PACKET = 5
	, GETSTATE_PACKET = 6
	, UNKNOWN_PACKET = 7
	, CALLSTOP_PACKET = 8
	, CALLACCEPT_PACKET = 9
	, CALLDECLINE_PACKET = 10
	, CALLBEGIN_PACKET = 11
	, CALLCLEAR_PACKET = 12

	, HOLD_PACKET = 13
	, UNHOLD_PACKET = 14

	, REJECT_PACKET = 15
	, ANSWER_PACKET = 17

	, BTNMASK_PACKET = 12

	, NULL_PACKET = 999

var
	HelloPacket =			createPacket( HELLO_PACKET, 'Hello', {

		get: function(socket){
			//air.trace('socket data received('+socket.bytesAvailable+'):')
			//air.trace(socket.readUTFBytes(socket.bytesAvailable))
			this.manager.setHello()
			this.manager.onWelcome()
		}
		,send: function(socket){
			socket.writeInt(PROTOCOL_VERSION)
		}
	})

	, WarningPacket =		createPacket( WARNING_PACKET, 'Warning', {

		get: function(socket){
			var messageLength = socket.readInt()
			this.message = socket.readUTFBytes( messageLength )
			this.manager.onWarning(this.message)
		}
		, getInfo: function(){
			return this.getLabel() +'\t'+ this.message
		}
	})

	, ErrorPacket =			createPacket( ERROR_PACKET, 'Error', {

		get: function(socket){
			var messageLength = socket.readInt()
			this.message = socket.readUTFBytes( messageLength )
			this.manager.onError( this.message );
		}
		, getInfo: function(){
			return this.getLabel() +'\t'+ this.message
		}
	})

	, AuthorizePacket =		createPacket( AUTHORIZE_PACKET, 'Authorize', {

		setLogin: function(login){ this.login = login }
		,setPassword : function(password){ this.password = password }
		,setInstrument : function(instrument){ this.instrument = instrument }
		,setExtension : function(extension){ this.extension = extension }
		,send : function(socket){
			/*for (var i in this){
				if( this.hasOwnProperty(i) )
					air.trace(i+' is '+ this[i] + '['+typeof(this[i])+']')
			}*/
			if( this.login.length && this.password.length && this.instrument.length && this.extension.length ){
				socket.writeInt( this.login.length );		socket.writeUTFBytes( this.login )
				socket.writeInt( this.password.length );	socket.writeUTFBytes( this.password )
				socket.writeInt( this.instrument.length );	socket.writeUTFBytes( this.instrument )
				socket.writeInt( this.extension )
			} else {
				Trace("Authorize packet required set login, password, instrument, extension")
			}
		}
		,get : function(socket){
			this.code = socket.readInt()
			var messageLength = socket.readInt()
			this.message = socket.readUTFBytes( messageLength )
			//Trace('Authorization: ' + this.message)
			this.manager.setAuthorized( this.code )
			this.manager.setError( this.message )
			this.manager.onConnected()
		}
		, getInfo: function(){
			return this.getLabel() + (
						'undefined'==typeof(this.code)
							?(this.login+':'+this.password+'@'+this.instrument+'/'+this.extension)
							:(' ['+ this.message + '/' + this.code+']')
					)
		}
	})

	, SetStatePacket =			createPacket(SETSTATE_PACKET, 'SetState', {
		setState : function(code){
			this.code = code
		}
		, send : function(socket){
			socket.writeInt( this.code )
		}
		, get : function(socket){
			this.code = socket.readInt()
			this.manager.onState( this.code )
		}
		, getInfo: function(){
			var stateData = State.getStateById(this.code)
			return this.getLabel() + ' ['
					+ (stateData ?  stateData.label : this.code)
					+ ']'
		}
	})

	, GetStatePacket =			createPacket(GETSTATE_PACKET, 'SetState', {
		getState : function(code){
			return this.code;
		}
		, get : function(socket){
		}
	})

	, UnknownPacket =			createPacket(UNKNOWN_PACKET, 'Unknown', {
		send : function(socket){
			if( this.code )
				socket.writeInt( code )
		}
		, get : function(socket){
			this.code = socket.readInt()
			this.manager.onUnknownPacket( this.code )
		}
	})

	// ======================= CALL PACKETS ==============================
	, CallStopPacket =			createPacket(CALLSTOP_PACKET, 'CallStop', {
		send : function(socket){}
		, get : function(socket){}
	})
	, CallAcceptPacket =			createPacket(CALLACCEPT_PACKET, 'CallAccept', {
		send : function(socket){}
		, get : function(socket){}
	})
	, CallDeclinePacket =			createPacket(CALLDECLINE_PACKET, 'CallDecline', {
		send : function(socket){}
		, get : function(socket){}
	})
	, CallBeginPacket =			createPacket(CALLBEGIN_PACKET, 'CallBegin', {
		getDevice : function(){
			return this.device // я не знаю зачем передаю номер на который звонили если я и так на нем сижу. Но пусть)
		}
		, getNumber : function(){
			return this.number
		}
		, send : function(socket){}
		, get : function(socket){
			var devLen = socket.readInt()
			this.device = socket.readUTFBytes(devLen)
			var numLen = socket.readInt()
			this.number = socket.readUTFBytes(numLen)
			this.manager.onCallBegin(this.device, this.number)
		}
		, getInfo: function(){
			var stateData = State.getStateById(this.code)
			return this.getLabel() + ' ['
					+ this.getNumber()
					+ ']'
		}
	})
	, CallClearPacket =			createPacket(CALLCLEAR_PACKET, 'CallClear', {
		send : function(socket){}
		, get : function(socket){}
	})

	// ======================= CALL PROCESS ===============================

	, HoldPacket =			createPacket(HOLD_PACKET, 'Hold', {
		send : function(socket){}
		, get : function(socket){}
	})
	, UnholdPacket =			createPacket(UNHOLD_PACKET, 'Unhold', {
		send : function(socket){}
		, get : function(socket){}
	})
	, RejectPacket =			createPacket(REJECT_PACKET, 'Reject', {
		send : function(socket){}
		, get : function(socket){}
	})

	, BtnMaskPacket =			createPacket(BTNMASK_PACKET, 'BtnMask', {
		send : function(socket){}
		, get : function(socket){}
	})

	, AnswerPacket =			createPacket(ANSWER_PACKET, 'Answer', {
		send : function(socket){}
		, get : function(socket){}
	})
	// ======================= OTHER PACKETS ==============================
	, NullPacket =			createPacket(NULL_PACKET, 'Null', {
		send : function(socket){}
		, get : function(socket){}
	})