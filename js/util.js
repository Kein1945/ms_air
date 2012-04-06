
CLASS = {
	instanceOf: function(theObject, theInterface){
		for (var member in theInterface){
			if ( typeof theObject[member] != typeof theInterface[member] ) {
				Trace( ["Object required implement interface method \""+member+"\"", theObject] )
				return false
			}
		}
		return true
	}
}


var objectOrientedList = function( elements ){
	var elements = elements || []
	this.eachHandler = function(type, callback){
		var found = false
		for(var k in elements)
			if(  CLASS.instanceOf( elements[k], type) {// object instance of interface
				found = true
				if( !callback.call( this, elements[k]) )// breakChain
					return found
			}
		return found
	}
	this.each = function( callback ){

	}
	this.push = function( element ){
		elements.push = element
	}
	this.flush = function(){
		elements = []
	}
}

var Trace = function(obj){
	if( "undefined" == typeof console )
		air.trace(obj)
	else
		console.log(obj)
}