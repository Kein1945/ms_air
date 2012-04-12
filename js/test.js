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
                        break
                    case cl.helpers.package.agent.authorize.id:
                            if( package.isSuccessful() ){
                                Trace( "Authorized" )
                            } else {
                                Trace("Authorization fail: "+package.message)
                                ctx.close()
                                State.setOffline();
                            }
                        break
                    case cl.helpers.package.service.buttonmask.id:

                        ENABLE_ANSWER = 1
                        ENABLE_CLEAR = 16
                        ENABLE_CONFERENCE_COMPLETE = 512
                        ENABLE_CONFERENCE_INIT = 256
                        ENABLE_HOLD =  4
                        ENABLE_LOGIN = 16777216
                        ENABLE_LOGOUT = 33554432
                        ENABLE_LOGOUT_WITH_REASON = 67108864
                        ENABLE_MAKECALL = 16
                        ENABLE_NOTREADY = 268435456
                        ENABLE_NOTREADY_WITH_REASON = 536870912
                        ENABLE_READY = 134217728
                        ENABLE_RELEASE = 2
                        ENABLE_RETRIEVE = 8
                        ENABLE_SINGLE_STEP_TRANSFER = 128
                        ENABLE_SINGLE_STEP_CONFERENCE = 1024
                        ENABLE_TRANSFER_COMPLETE = 64
                        ENABLE_TRANSFER_INIT = 32

                        $('#enable_answer').attr('checked', (package.mask & ENABLE_ANSWER) != 0 )
                        $('#enable_clear').attr('checked', (package.mask & ENABLE_CLEAR) != 0 )
                        // $('#ENABLE_CONFERENCE_COMPLETE').attr('checked', (package.mask & ENABLE_CONFERENCE_COMPLETE) != 0 )
                        // $('#ENABLE_CONFERENCE_INIT').attr('checked', (package.mask & ENABLE_CONFERENCE_INIT) != 0 )
                        $('#enable_hold').attr('checked', (package.mask & ENABLE_HOLD) != 0 )
                        $('#enable_login').attr('checked', (package.mask & ENABLE_LOGIN) != 0 )
                        $('#enable_logout').attr('checked', (package.mask & ENABLE_LOGOUT) != 0 )
                        //$('#ENABLE_LOGOUT_WITH_REASON').attr('checked', (package.mask & ENABLE_LOGOUT_WITH_REASON) != 0 )
                        $('#enable_makecall').attr('checked', (package.mask & ENABLE_MAKECALL) != 0 )
                        $('#enable_notready').attr('checked', (package.mask & ENABLE_NOTREADY) != 0 )
                        $('#ENABLE_notready_with_reason').attr('checked', (package.mask & ENABLE_NOTREADY_WITH_REASON) != 0 )
                        $('#enable_ready').attr('checked', (package.mask & ENABLE_READY) != 0 )
                        $('#enable_release').attr('checked', (package.mask & ENABLE_RELEASE) != 0 )
                        $('#enable_retrieve').attr('checked', (package.mask & ENABLE_RETRIEVE) != 0 )
                        // $('#ENABLE_SINGLE_STEP_TRANSFER').attr('checked', (package.mask & ENABLE_SINGLE_STEP_TRANSFER) != 0 )
                        // $('#ENABLE_SINGLE_STEP_CONFERENCE').attr('checked', (package.mask & ENABLE_SINGLE_STEP_CONFERENCE) != 0 )
                        // $('#ENABLE_TRANSFER_COMPLETE').attr('checked', (package.mask & ENABLE_TRANSFER_COMPLETE) != 0 )
                        // $('#ENABLE_TRANSFER_INIT').attr('checked', (package.mask & ENABLE_TRANSFER_INIT) != 0 )


                        break
                    case cl.helpers.package.agent.setstate.id:
                            Trace("Set state '"+ cl.state.byID(package.code).name + "'")
                        break
                    case cl.helpers.package.call.begin.id:
                        // Блда;д! Нам звонят! Срочно поднимаем трубку!
                            ctx.getChannel().write( new(cl.package.call.answer.instance)() )
                        break
                    case cl.helpers.package.call.established.id:
                            setTimeout(function(){
                                // Пффф, он нам надоел, холд его
                                ctx.getChannel().write( new(cl.package.call.hold.instance)() )
                            }, 2000)
                        break
                    case cl.helpers.package.call.hold.id:
                            setTimeout(function(){
                                // Подождали, соскучились
                                ctx.getChannel().write( new(cl.package.call.unhold.instance)() )
                            }, 2000)
                        break
                    case cl.helpers.package.call.unhold.id:
                            setTimeout(function(){
                                // Пффф, он нам надоел, кладем трубку
                                ctx.getChannel().write( new(cl.package.call.release.instance)() )
                            }, 2000)
                        break
                    default:
                }
            }
            , exceptionCaught: function(e){
                throw e
            }
            , channelDisconnected: function(ctx){
                Trace("Disconnected from server")
                Quit()
            }
        } 

    var c = new nsock( { host: '127.0.0.1', port: 32562}, [
    	nsockHandler
        , new (cl.handlers.encoder)()
        , new (cl.handlers.decoder)()
    ])
    c.connect()
})


function Quit() {
    var event = new air.Event(air.Event.EXITING, false, true);
    air.NativeApplication.nativeApplication.dispatchEvent(event);
    if (!event.isDefaultPrevented()) {
        air.NativeApplication.nativeApplication.exit();
    }
}