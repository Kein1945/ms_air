var ConnectHandlers = {
	encoderInterface : {
		encode: function(data, channel){}
	}
	, decoderInterface : {
		decode: function(channel){} // return data packet
	}
	, handlerInterface : {
		channelConnected : function(ctx){}
		, channelDisconnected: function(ctx){}
		, messageReceived : function(packet, ctx){}
		, exceptionCaught: function(e){}
	}
}

var Connect = function(server, handlers){
	var self = this
		, server = server
		, socket = null
	this.listeners = []

	this.handlers = new objectOrientedList( handlers || [] )
	this.getSocket = function(){
		return socket
	}
	this.sock = this.getSocket
	this.flushSocket = function(){
		if (null != socket && socket.connected)
			socket.close()
		socket = new air.Socket()
	}
	this.getPort = function(){
		return server.port
	}
	this.getHost = function(){
		return server.host
	}
	this.getHandlers = function(){
		return this.handlers
	}
	this.channel = null
	this.getChannel = function(){
		return this.channel
	}
}

Connect.prototype = {
	isActive : function(){
		return this.sock().connected
	}
	, connect: function(){
		this.flushSocket()
		this.channel = new Channel(this.sock(), this.handlers)
		Trace("Chanel created")
		this.sock().connect(this.getHost(), this.getPort())
		this.initListeners()
		Trace("Connect complete")
	}
	, close: function(){
		this.flushSocket()
	}
	, initListeners : function(){
		var connect = this
		this.sock().addEventListener( air.Event.CONNECT, function(){
			Trace("Connect raw connect")
			connect.handlers.eachHandler.call( connect, ConnectHandlers.handlerInterface, function(handler){
				Trace("Connect event")
				handler.channelConnected( this )
			})
		})
		this.sock().addEventListener( air.Event.CLOSE, function(){
			connect.handlers.eachHandler.call( connect, ConnectHandlers.handlerInterface, function(handler){
				handler.channelDisconnected(this)
			} )
		})
		this.sock().addEventListener( air.ProgressEvent.SOCKET_DATA, function(){
			Trace("Connect raw data")
			connect.handlers.eachHandler.call( connect, ConnectHandlers.handlerInterface, function(handler){
				Trace("Connect data")
				handler.messageReceived( this.channel.decode(), this )
			})
		})
		this.sock().addEventListener( air.IOErrorEvent.IO_ERROR, function(e){
			connect.handlers.eachHandler.call( connect, ConnectHandlers.handlerInterface, function(handler){
				handler.exceptionCaught(e)
			})
		})
	}
}


var Channel = function(socket, handlers){
	this.getRawSocket = function(){
		return socket
	}
	this.rs = this.getRawSocket //alias
	this.encode = function(data){ // Encode data for writing to socket
		var encoded = false
		handlers.eachHandler.call( this, ConnectHandlers.encoderInterface, function(encoder){
			if( null == encoder.encode( data, this ) )
				return !(encoded=true)
		})

		if( !encoded )
			throw ["Undefined data for encode", data]
	}
	this.decode = function(){ // Decode socket received data
		var decodedData = null
			, decoded = false
		handlers.eachHandler.call( this, ConnectHandlers.decoderInterface, function(decoder){
			decoded = true
			decodedData = decoder.decode( this.rs() )
		})
		if(!decoded)
			throw "Decoders not found in handlers pull"
		return decodedData
	}
}

Channel.prototype = {
	write : function(data){
		switch( typeof(data) ){
			case "number":
				this.writeInt( data )
				break;
			case "string":
				this.writeString( data )
			default:
				this.encode( data )
				Trace(">> ")
		}
	}
	, writeInt : function(data){
		Trace("Write int " + data)
		this.rs().writeInt( parseInt(data) )
	}
	, writeString : function(data){
		this.writeInt(data.length)
		this.rs().writeUTFBytes( data )
	}
	, readInt : function(){
		return this.rs().readInt()
	}
	, readString : function(){
		var messageLength = this.rs().readInt()
		return this.rs().readUTFBytes( messageLength )
	}
}