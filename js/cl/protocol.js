var cl = {}

cl.state = {
	login : { label: 'Login', id: 0, name: 'login' }
	, logout : { label: 'Logout', id: 1, name: 'logout' }
	, notReady : { label: 'Not ready', id: 2, name: 'notReady' }
	, available : { label: 'Avaliable', id: 3, name: 'available' }
	, talking : { label: 'Talinkg', id: 4, name: 'talking' }
	, workNotReady : { label: 'Work not ready', id: 5, name: 'workNotReady' }
	, workReady : { label: 'Work ready', id: 6, name: 'workReady' }
	, busyOther : { label: 'Busy other', id: 7, name: 'busyOther' }
	, reserved : { label: 'Reserved', id: 8, name: 'reserved' }
	, unknown : { label: 'Unknown', id: 9, name: 'unknown' }
	, hold : { label: 'Hold', id: 10, name: 'hold' }
	, byID: function( searchID ){
		for (var i in cl.state)
			if( searchID == cl.state[i].id )
				return cl.state[i]
	}
}

cl.handlers = {
	// Базовый енкодер для CL протокола
	encoder : function(){
		this.encode = function(package, channel){
			if( !CLASS.instanceOf( package, cl.interface.package ) )
				return package
			channel.writeInt( package.getID() )
			package.send( channel )
			channel.rs().flush()
			Trace( package.getInfo() )
		}
	}
	// Базовый декдоер для CL протокола
	, decoder: function(){
		this.decode = function(channel){
			var id = channel.readInt()
			if( cl.package.list.isExists(id) ){
				var package = cl.package.list.get( id )
				package.setUID( channel.readInt() ) 
				package.get( channel )
				Trace( package.getInfo() )
				return package
			} else {
				throw "Failed to encode package with id "+id
				return false
			}
		}
	}
}

cl.interface = {
	package: {
		getID : function(){}
		, getName: function(){}
		, send : function(channel){}
		, get : function(channel){}
		, getInfo: function(){}
	}
}

cl.helpers = {
	createPackagePrototype: function(meta, methods){
		var packagePrototype = function(){}
			, packageUID = null
			, packageID = meta.id
			, packageName = meta.name
			, methods = methods || {}
		packagePrototype.prototype = {
			getName : function(){ return packageName }
			, getID : function(){ return packageID }
			, getUID : function(){ return packageUID }
			, setUID : function(UID){ packageUID = UID }
			, getLabel : function(){ return this.getName() + (packageUID?(' < '+packageUID):' >') + "\t" }
			, getInfo : function(){ return this.getLabel() }
		}

		for ( name in methods )
			packagePrototype.prototype[name] = methods[name]
		if ( "undefined" == typeof( packagePrototype.prototype.get ) ) packagePrototype.prototype.get = function(){ }//throw "Package "+packageName+" should implement method get"}
		if ( "undefined" == typeof( packagePrototype.prototype.send ) ) packagePrototype.prototype.send = function(){}// throw "Package "+packageName+" should implement method send"}
		return {
			id: packageID
			, name: packageName
			, instance: packagePrototype
		}
	}
}

cl.package = {
	list : new (function(){
		var availablePackages = []
		this.isExists = function(id){
			return typeof(availablePackages[id]) != "undefined"
		}
		this.get = function(id){
			return new (availablePackages[id].instance)()
		}
		this.push = function(package){
			availablePackages[ package.id ] = package
		}
	})()
}