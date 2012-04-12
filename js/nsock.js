/* Usage */
/*

(nsock.interface.handler) MyMessageHandler = {
	channelConnected : function( ctx ){}
	, channelDisconnected: function( ctx ){}

	, messageReceived : function( package, ctx ){
		// package - your object that returned by decoder
		var message = new MyCustomDataPackage()
		ctx.getChannel().write( message ) // Your encoder receives this MyCustomDataPackage() object and must encode data to stream
	}
	, exceptionCaught: function( exceptio n){}
}

var connect = new nsock( {host: host, port: port}, [
	new (nsock.interface.encoder) MyDataEncoder()
	// ... any encoders you need
	, new (nsock.interface.decoder) MyDataDecoder()
	, MyMessageHandler
	// nsock.interface.handler
	// ... any handlers you need
])

*/

var nsock = (function(){
	var Channel = function(socket, handlers){
		this.getRawSocket = function(){
			return socket
		}
		this.rs = this.getRawSocket //alias
		this.encode = function(data){ // Encode data for writing to socket
			var encoded = false
			handlers.eachInterface.call( this, nsock.interface.encoder, function(encoder){
				if( null == encoder.encode( data, this ) )
					return !( encoded = true )
			})

			if( !encoded )
				throw ["Undefined data for encode or encoders not found", typeof data, data]
		}
		this.decode = function(){ // Decode socket received data
			var decodedData = []
				, decoded = false
			while(this.rs().bytesAvailable > 0)
				handlers.eachInterface.call( this, nsock.interface.decoder, function(decoder){
					decoded = true
					decodedData.push( decoder.decode( this ) )
				})
			if(!decoded)
				throw "Decoders not found in handlers pull"
			return decodedData
		}
	}

	Channel.prototype = {
		/**
		 * Trying to write to socket simple type object.
		 * If fail to define type, trying to encode data
		 */
		write : function(data){

			switch( typeof(data) ){
				case "number":
					this.writeInt( data )
					break;
				case "string":
					this.writeString( data )
					break;
				default:
					this.encode( data )
			}
		}
		, writeInt : function(data){
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
		, flush: function(){
			this.rs().flush()
		}
	}

	var Connect = function(server, handlers){
		var self = this
			, handlers = new extendedObjectArray( handlers || [])
			, listeners = []
			, socket = null
			, channel = null
		this.getPort = function(){ return server.port }
		this.getHost = function(){ return server.host }
		this.getChannel = function(){ return channel }
		this.getHandlers = function(){ return handlers }
		this.getSocket = function(){ return socket }
		this.sock = this.getSocket // Alias
		this.flushSocket = function(){
			if (null != socket && socket.connected)
				socket.close()
			socket = new air.Socket()
		}
		this.eachHandler = function(callback){
			handlers.eachInterface.call( this, nsock.interface.handler, callback)
		}
		this.connect = function(){
			this.flushSocket()
			channel = new Channel(socket, handlers)
			Trace("Chanel created")
			socket.connect( server.host, server.port)
			this.initListeners()
			Trace("Connect complete")
		}
	}

	Connect.prototype = {
		isActive : function(){
			return this.sock().connected
		}
		, close: function(){
			this.flushSocket()
		}
		, initListeners : function(){
			var connect = this
			this.sock().addEventListener( air.Event.CONNECT, function(){
				Trace("Connection established")
				connect.eachHandler( function(handler){
					handler.channelConnected( this )
				})
			})
			this.sock().addEventListener( air.Event.CLOSE, function(){
				connect.eachHandler( function(handler){
					handler.channelDisconnected(this)
				})
			})
			this.sock().addEventListener( air.ProgressEvent.SOCKET_DATA, function(){
				connect.eachHandler( function(handler){
					var packetsReceived = this.getChannel().decode()
					for(var k in packetsReceived){
						handler.messageReceived( packetsReceived[k], this )	
					}
				})
			})
			this.sock().addEventListener( air.IOErrorEvent.IO_ERROR, function( exception ){
				Trace( ["Socket exception catch", exception] )
				connect.eachHandler( function(handler){
					handler.exceptionCaught( exception )
				})
			})
		}
	}

	return Connect
})()

nsock.interface = {
	encoder: {
		/**
		 * @package - data object
		 * @return if encode successful must return null, 
		 */
		encode: function( package, channel ){} // 
	}
	, decoder : {
		/**
		 * Calling on data receiving.
		 * @return - data package 
		 */

		decode: function( channel ){}
	}
	, handler: {
		/**
		 * Fired on socket connection
		 */
		channelConnected : function( ctx ){}
		/**
		 * Fired on socket disconnect
		 */
		, channelDisconnected: function( ctx ){}
		/**
		 * Fired on package of data received
		 */
		, messageReceived : function( package, ctx ){}
		/**
		 * Fire on IO exception
		 */
		, exceptionCaught: function( exception){
			throw exception
		}
	}
	, channel: {
		write : function(data){}
		, writeInt : function(data){}
		, writeString : function(data){}
		, readInt : function(){}
		, readString : function(){}
		, flush: function(){}
	}
}