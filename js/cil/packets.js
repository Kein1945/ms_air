var packetIDs = {
        Info: 1
        Warning: 2
        Error: 3

        Hello: 10
        Authorize: 11
        SetState: 12
        GetState: 13

        CallBegin: 101
        CallAnswer: 102
        CallReject: 103
        CallHold: 104
        CallUnhold: 105
        CallEnd: 106

        , BTNMASK_PACKET = 12

        , NULL_PACKET = 999
}

, HelloPacket = cil_protocol.makePacketPrototype(1, "Hello", {
                send: function(c) { c.write(1) }
                , get: function(c) {
                        Trace("Hello received")
                }
        })

, AuthorizePacket = cil_protocol.makePacketPrototype( 4, 'Authorize', {
        setLogin: function(login){ this.login = login }
        , setPassword : function(password){ this.password = password }
        , setInstrument : function(instrument){ this.instrument = instrument }
        , setExtension : function(extension){ this.extension = extension }
        , send : function(channel){
                if( this.login.length && this.password.length && this.instrument.length && this.extension ){
                        channel.write( this.login )
                        channel.write( this.password )
                        channel.write( this.instrument )
                        channel.write( this.extension )
                } else {
                        Trace("Authorize packet required set login, password, instrument, extension")
                }
        }
        , get : function(channel){
                this.code = channel.readInt()
                this.message = channel.readString()
        }
        , getInfo: function(){
                return this.getLabel() +
                ( 'undefined'==typeof(this.code) ? (this.login+':'+this.password+'@'+this.instrument+'/'+this.extension)
                        :(' ['+ this.message + '/' + this.code+']')
                )
        }
})

, WarningPacket = cil_protocol.makePacketPrototype( 4, 'Warning', {
        get: function(channel){
                var messageLength = socket.readInt()
                this.message = channel.readString()
                this.manager.onWarning(this.message)
        }
        , getInfo: function(){
                return this.getLabel() +'\t'+ this.message
        }
})
, ErrorPacket = cil_protocol.makePacketPrototype( ERROR_PACKET, 'Error', {

                get: function(socket){
                        var messageLength = socket.readInt()
                        this.message = socket.readUTFBytes( messageLength )
                        this.manager.onError( this.message );
                }
                , getInfo: function(){
                        return this.getLabel() +'\t'+ this.message
                }
        })


cil_protocol.addPacketPrototype( HelloPacket )
cil_protocol.addPacketPrototype( AuthorizePacket )