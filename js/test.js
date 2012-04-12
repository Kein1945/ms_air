$(function(){
    var result = {
        connect : false
        , messageReceived : false
        , exceptionCaught : false
    }

    var nsockHandler = {
            channelConnected : function(ctx){
                Trace("Connect")
                ctx.getChannel().write( new (cl.package.hello.instance)() )
            }
            , messageReceived : function(package, ctx){
                switch(package.getID()){
                    case cl.helpers.package.service.hello.id:
                            var p = new (cl.package.authorize.instance)()
                            p.login = 'bsalmanov'
                            p.password = '123654'
                            p.instrument = '56704'
                            p.extension = 5000
                            ctx.getChannel().write( p )
                        break;
                    case cl.helpers.package.agent.authorize.id:
                            Trace( "Authorized" )
                        break;
                    default:
                        Trace("Package " + package.getName() + " does not proceeded")
                }
            }
            , exceptionCaught: function(e){
                throw e
            }
            , channelDisconnected: function(ctx){
                Trace("Disconnected from server")
            }
        } 

    var c = new nsock( { host: '127.0.0.1', port: 32562}, [
    	nsockHandler
        , new (cl.handlers.encoder)()
        , new (cl.handlers.decoder)()
    ])
    c.connect()
})