
var cil_protocol = (function(){
	var availablePackets = []
		, isPacketExists = function(id){
			return typeof(availablePackets[id]) != "undefined"
		}
		, getPacketById = function(id){
			return new (availablePackets[id])()
		}
	return {
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
				if( isPacketExists(id) ){
					var packet = getPacketById(id)
					packet.get(channel)
					return packet
				} else {
					throw "Failed to encode packet with id "+id
					return false
				}
			}
		}
		, isPacketExists: isPacketExists
		, getPacketById: getPacketById
		, packetInterface : {
			getId : function(){}
			, getName: function(){}
			, send : function(channel){}
			, get : function(channel){}
		}
		, addPacketPrototype: function(id, packetPrototype){
			return availablePackets[id] = packetPrototype
		}
	}
})()