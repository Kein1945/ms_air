
var cil_protocol = {
	encoder : function(){
		this.encode = function(data, channel){
			if( !CLASS.instanceOf( data, cil_protocol.packetInterface ) )
				return data
			channel.write( data.getId() )
			data.send(channel)
		}
	}
	, decoder: function(){
		this.decode = function(channel){
			// read
			// return packet
		}
	}
	, packetInterface : {
		getId : function(){
			return 1
		}
		, send : function(channel){}
		, get : function(channel){}
	}
}