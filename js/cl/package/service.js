cl.package.hello = cl.helpers.createPackagePrototype( cl.helpers.package.service.hello, {
    send: function(channel) {
    	channel.write( cl.helpers.package.version )
    }
})

cl.package.buttonmask = cl.helpers.createPackagePrototype( cl.helpers.package.service.buttonmask, {
    get: function(channel) {
    	this.mask = channel.readInt()
    }
    , getInfo: function(){
    	return this.getLabel() + '\t' + this.mask
    }
});

(function(){
	var messagePrototype = {
		get: function(channel){
			this.message = channel.readString()
		}
		, getInfo: function(){
			return this.getLabel() +'\t'+ this.message
		}
	}

	cl.package.info = cl.helpers.createPackagePrototype( cl.helpers.package.service.info, messagePrototype)

	cl.package.warning = cl.helpers.createPackagePrototype( cl.helpers.package.service.warning, messagePrototype)

	cl.package.error = cl.helpers.createPackagePrototype( cl.helpers.package.service.error, messagePrototype)
})()



cl.package.list.push( cl.package.hello )
cl.package.list.push( cl.package.buttonmask )

cl.package.list.push( cl.package.info )
cl.package.list.push( cl.package.warning )
cl.package.list.push( cl.package.error )