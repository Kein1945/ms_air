var packetManager = (function(){
		var packetList = {}
		var getPacketById = function(id){
				if( typeof(packetList[id]) != "undefined" ){
					return new packetList[id]()
				} else {
					return false
				}
			}
		return {
			addPacket : function(id, packet){
				packetList[id] = packet;
			}
			, proceedData : function(socket, success, error){
				error = error || function(){}
				var id = socket.readInt()
				var packet = getPacketById( id )
				if( packet ){
					packet.packetTimeId = socket.readInt()
					//Trace('<< '+packet.getName()+'['+packetTimeId+']')
					packet.setSocket( socket )
					success( packet )
					Trace( packet.getInfo(), 'in ' + ( (-1!=[2, 3, 7].indexOf(id)) ? 'btn-danger' : 'btn-inverse') )
				} else {
					Trace("? Unknown packet id: " + id)
					error()
				}
			}
		}
	})()

createPacket = function(id, packetName, methods){
	var packetPrototype = function(){}
	packetPrototype.prototype.getName = function(){ return packetName }
	packetPrototype.prototype.getId = function(){ return id }
	packetPrototype.prototype.setManager = function(manager){ this.manager = manager }
	packetPrototype.prototype.setSocket = function(socket){ this.socket = socket }
	packetPrototype.prototype.getLabel = function(){ return (( typeof(this.packetTimeId) !='undefined' )?('['+this.packetTimeId+']'):'')+"\t\"" + this.getName() + '" '; }
	packetPrototype.prototype.getInfo = function(){ return this.getLabel(); }
	for ( name in methods ){
		packetPrototype.prototype[name] = methods[name]
	}
	if( !methods['get'] ) {packetPrototype.prototype.get = function(){ Trace('Packet "'+packetName+'" hasnt method get') }}
	if( !methods['send'] ) {
		packetPrototype.prototype.send = function(){ Trace('Packet "'+packetName+'" hasnt method send') }
	} else{
		packetPrototype.prototype.send = function(socket){
			Trace(this.getInfo(), 'out btn-primary')
			socket.writeInt(this.getId())
			methods.send.call(this, socket)
			socket.flush()
		}
	}
	packetManager.addPacket(id, packetPrototype)
	return packetPrototype;
}