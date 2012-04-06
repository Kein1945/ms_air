
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
			var id = channel.readInt()
			for(var index in cil_protocol.availablePackets){
				if( index == id ){
					var packet = new cil_protocol.availablePackets[index]()
					packet.get(channel)
					return packet
				}
			}
			throw "Failed to encode packet with id "+id
			return false
		}
	}
	, packetInterface : {
		getId : function(){}
		, getName: function(){}
		, send : function(channel){}
		, get : function(channel){}
	}
	, availablePackets : []
}