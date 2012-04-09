cl.package.call = {}

cl.package.call.begin = cl.helpers.createPackagePrototype( cl.helpers.package.call.begin, {
	get : function(channel){
		this.device = channel.readString()
		this.number = channel.readString()
	}
	, getInfo: function(){
		return this.getLabel() + ' ['
					+ this.getNumber()
					+ ']'
	}
})

cl.package.call.answer = cl.helpers.createPackagePrototype( cl.helpers.package.call.answer )
cl.package.call.reject = cl.helpers.createPackagePrototype( cl.helpers.package.call.reject )

cl.package.call.hold = cl.helpers.createPackagePrototype( cl.helpers.package.call.hold )
cl.package.call.unhold = cl.helpers.createPackagePrototype( cl.helpers.package.call.unhold )

cl.package.call.end = cl.helpers.createPackagePrototype( cl.helpers.package.call.end )


cl.package.list.push( cl.package.call.begin )

cl.package.list.push( cl.package.call.answer )
cl.package.list.push( cl.package.call.reject )

cl.package.list.push( cl.package.call.hold )
cl.package.list.push( cl.package.call.unhold )

cl.package.list.push( cl.package.call.end )