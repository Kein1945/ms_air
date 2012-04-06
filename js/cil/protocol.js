
var cil_protocol = (function(){
	var availablePackets = []
		// Проверяет существует ли пакет с нужным ID
		, isPacketExists = function(id){
			return typeof(availablePackets[id]) != "undefined"
		}
		// Возвращает объект пакета, по ID пакета
		, getPacketById = function(id){
			return new (availablePackets[id].instance)()
		}
	return {
		// Базовый енкодер для CIL протокола
		encoder : function(){
			this.encode = function(data, channel){
				if( !CLASS.instanceOf( data, cil_protocol.packetInterface ) )
					return data
				data.send(channel)
			}
		}
		// Базовый декдоер для CIL протокола
		, decoder: function(){
			this.decode = function(channel){
				var id = channel.readInt()
				if( isPacketExists(id) ){
					var packet = getPacketById(id)
					packet.setUID( channel.readInt() ) 
					packet.get(channel)
					Trace( packet.getInfo() )
					return packet
				} else {
					throw "Failed to encode packet with id "+id
					return false
				}
			}
		}
		, isPacketExists: isPacketExists
		, getPacketById: getPacketById
		, addPacketPrototype: function(packetPrototype){
			return availablePackets[packetPrototype.id] = packetPrototype
		}
		/**
		 * Возвращает функцию реализующую интерфейс cil_protocol.packetInterface, что бы можно было добавить ей в список доступных пакетов
		 * Все реализация прототипа лежит на этом методе. Минимально необходимые методы для класса get или set
		 */
		, makePacketPrototype: function(id, packetName, methods){
			var packetPrototype = function(){}
				, packetUid = null
			packetPrototype.prototype.getName = function(){ return packetName }
			packetPrototype.prototype.getId = function(){ return id }
			packetPrototype.prototype.getUID = function(){ return packetUid }
			packetPrototype.prototype.setUID = function(UID){ packetUid = UID }
			packetPrototype.prototype.getLabel = function(){
				return this.getName() + ' '+ (packetUid?(':'+packetUid):'>') + "\t";
			}
			packetPrototype.prototype.getInfo = function(){ return this.getLabel(); }
			for ( name in methods ){
				packetPrototype.prototype[name] = methods[name]
			}
			if( !methods['get'] ) {packetPrototype.prototype.get = function(){ throw 'Packet "'+packetName+'" not implement method get' }}
			if( !methods['send'] ) {
				packetPrototype.prototype.send = function(){ throw 'Packet "'+packetName+'" not implement method send' }
			} else{
				packetPrototype.prototype.send = function(channel){
					channel.writeInt(this.getId())
					methods.send.call(this, channel)
					channel.rs().flush()
					Trace(this.getInfo())
				}
			}
			return {
				id: id,
				name: packetName
				instance: packetPrototype
			}
		}
		, packetInterface : {
			getId : function(){}
			, getName: function(){}
			, send : function(channel){}
			, get : function(channel){}
			, getInfo: function(){}
		}
	}
})()