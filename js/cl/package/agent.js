cl.package.authorize = cl.helpers.createPackagePrototype( cl.helpers.package.agent.authorize, {
    send : function(channel){
        channel.write( this.login )
        channel.write( this.password )
        channel.write( this.instrument )
        channel.write( this.extension )
    }
    , get : function(channel){
        this.code = channel.readInt()
        this.message = channel.readString()
    }
    , getInfo: function(){
        return this.getLabel() +
	        ( 'undefined' == typeof(this.code)
	        	? (this.login /*+ ':' + this.password + '@'*/ + this.instrument + '/' + this.extension)
	            : ('[' + this.code + '] ' + this.message)
	        )
    }
})

cl.package.setstate = cl.helpers.createPackagePrototype( cl.helpers.package.agent.setstate, {
	send : function(channel){
		channel.writeInt( this.code )
	}
	, get : function(channel){
		this.code = channel.readInt()
	}
	, getInfo: function(){
		var state = cl.state.byID( this.code )
		return this.getLabel() + ' ['
				+ ( state ?  state.label : this.code )
				+ ']'
	}
})

cl.package.getstate = cl.helpers.createPackagePrototype( cl.helpers.package.agent.getstate, {
	send: function(channel){
		channel.writeInt( this.code )
	}
	, getInfo: function(){
		var state = cl.state.byID( this.code )
		return this.getLabel() + ' ['
				+ ( state ?  state.label : this.code )
				+ ']'
	}
})

cl.package.list.push( cl.package.authorize )
cl.package.list.push( cl.package.setstate )
cl.package.list.push( cl.package.getstate )