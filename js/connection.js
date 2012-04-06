// Started

var Connection = function(host, port){
	var self = this
	this.host = host
	this.port = port
	this.authorized = false
	this.hello = false
	this.listeners = []
	this.ON_AUTHORIZE = 1
	this.ON_AUTHORIZE_FAIL = 2
	this.ON_DISCONNECT = 3
	this.ON_STATE = 4
	this.ON_CALLBEGIN = 5
	this.ON_WELCOME = 6
	this.ON_WELCOME_FAIL = 7
	this.ON_ERROR = 8
	this.ON_WARNING = 9

	this.socket = new air.Socket()

	this.socket.addEventListener( air.Event.CONNECT, function(){
		var p = new HelloPacket()
		p.send(self.socket)
	})

	this.socket.addEventListener( air.ProgressEvent.SOCKET_DATA, function(){
		packetManager.proceedData( self.socket, function(packet){
			packet.setManager(self)
			packet.get( self.socket )
		},function(){
			// Error
		})
	})

	this.socket.addEventListener( air.IOErrorEvent.IO_ERROR, function(){
		self.fireEvent(self.ON_DISCONNECT, {reason: 'Server not answer'})
		Trace("IO error")
	})

	this.socket.addEventListener( air.OutputProgressEvent.OUTPUT_PROGRESS, function(){
		Trace("Out")
	})

	this.socket.addEventListener( air.Event.CLOSE, function(){
		self.fireEvent(self.ON_DISCONNECT, {reason: false})
	})
	this.addEventListener(this.ON_DISCONNECT, function(){
		self.clearState()
	})
	//this.socket.connect()
}

Connection.prototype = {
	connect : function(){
		if( this.socket.connected ){
			this.socket.close()
		}
		this.socket.connect(this.host, this.port)
	}
	, disconnect : function(reason){
		reason = (typeof(reason) =='undefined')?false:reason
		if( this.socket.connected )
			this.socket.close()
		this.fireEvent(this.ON_DISCONNECT, {reason: reason})
	}
	, authorize : function(){
		if( !this.isWelcome() ) Trace('Please hello before')
		var AuthPacket = new AuthorizePacket();
		
		AuthPacket.setLogin( this.login )
		AuthPacket.setPassword( this.password )
		AuthPacket.setInstrument( this.instrument )
		AuthPacket.setExtension( this.extension )
		//AuthPacket.send( this.socket )
		this.send( AuthPacket )
	}
	, setLogin: function(login){ this.login = (login.length>0) ? login : '0' }
	, setPassword : function(password){ this.password = (password.length>0) ? password : '0' }
	, setInstrument : function(instrument){ this.instrument = (instrument.length>0) ? instrument : '0' }
	, setExtension : function(extension){ this.extension = extension }

	, setHello : function(){ this.hello = true }
	, isWelcome : function(){ return this.hello }
	, setAuthorized : function(code){ this.authorized = (1==code) }
	, isAuthorized : function(){
		return this.authorized
	}
	, onAuthorized : function(){
		this.fireEvent(this.ON_AUTHORIZE)
	}
	, onAuthorizedFail : function(msg){
		this.fireEvent(this.ON_AUTHORIZE_FAIL, {reason: msg })
	}

	, onWelcome : function(){

		this.fireEvent(this.ON_WELCOME)
	}
	, onConnected: function(){
		if( this.isAuthorized() )
			this.onAuthorized()
		else
			this.onAuthorizedFail( this.getError() )
	}
	, onDisconnected : function(reason){
		this.fireEvent(this.ON_DISCONNECT, {reason: reason})
	}
	, clearState : function(){
		this.authorized = false
		this.hello = false
	}
	, setState : function(code){
		if( !this.isAuthorized() ) {
			Trace('Must be authorized before change state','btn-danger')
			this.fireEvent(this.ON_ERROR, {reason: 'Please athorize before set state'})
			return;
		}
		var statePacket = new SetStatePacket()
		statePacket.setState( code )
		this.send( statePacket )
	}
	, onState : function(code){
		this.fireEvent(this.ON_STATE, {state: code})
	}

	, onUnknownPacket : function(code){
		Trace('Unknown packet from client with id '+code, 'btn-danger')
		this.fireEvent(this.ON_ERROR, {reason: 'Application error. Update your application or contact with your administarator. Unknown packet with id "' + code + '".'})
	}

	, onError: function(message){
		this.fireEvent(this.ON_ERROR, {reason: message})
		this.disconnect( message )
	}
	, onWarning: function(message){
		this.fireEvent(this.ON_WARNING, {reason: message})
	}
	, onCallBegin : function(device, number){
		this.fireEvent(this.ON_CALLBEGIN, {device: device, number: number})
	}
	, clearCall: function(){
		this.send(new CallClearPacket())
	}

	, setError : function(msg){ this.error = msg }
	, getError : function(){ return this.error }

	, addEventListener : function(type, callback){
		if( !this.listeners[type] ) this.listeners[type] = []
		this.listeners[type][ this.listeners[type].length ] = callback
	}
	, fireEvent: function(type, event){
		event = event || {}
		if( this.listeners[type] )
			for (var i in this.listeners[type])
				if( false === this.listeners[type][i]( event ) )
					return false
		return true
	}
	, send : function(packet){
		packet.send(this.socket)
	}
}