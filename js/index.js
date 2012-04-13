var incommingCallUrl =  'http://test.plan.dellin.ru/call/incomming.html?number=%number%&device=%device%'
    , worker = function(){
    var wrk = function(){}
    wrk.prototype = {
        connect: function(host, port){
            if( "undefined" == typeof(this.ctx)){
                //this.ctx = new nsock( { host: '192.168.14.159', port: 32562}, [
                this.ctx = new nsock( { host: '127.0.0.1', port: 32562}, [
                    this
                    , new (cl.handlers.encoder)()
                    , new (cl.handlers.decoder)()
                ])
            }
            this.ctx.connect()
        }
        , disconnect: function(){
            this.ctx.close()
            State.setOffline()
            State.enable()
        }
        , setState: function(idOrName){
            state = cl.state[ ("string" == typeof(idOrName)) ? "byName" : "byID"]( idOrName )
            if( "undefined" == typeof( state ) ){
                throw "Unknown state \"" + idOrName + "\""
            }
            var p = new (cl.package.setstate.instance)()
            p.code = state.id
            this.channel.write( p )
        }
        , callAnswer: function(){
            this.ctx.getChannel().write( new(cl.package.call.answer.instance)() )
        }
        , callRelease: function(){
            this.ctx.getChannel().write( new(cl.package.call.release.instance)() )
        }
        , callHold: function(){
            this.ctx.getChannel().write( new(cl.package.call.hold.instance)() )
        }
        , callUnhold: function(){
            this.ctx.getChannel().write( new(cl.package.call.unhold.instance)() )
        }
        // nsock handler interface
        , channelConnected : function(ctx){
            Trace("Connect")
            this.channel = ctx.getChannel()
            this.channel.write( new (cl.package.hello.instance)() )
            this.ctx = ctx
        }
        , messageReceived : function(package, ctx){
            switch(package.getID()){
                case cl.helpers.package.service.hello.id:
                        var p = new (cl.package.authorize.instance)()
                        p.login = readSettings('login')
                        p.password = readSettings('password')
                        p.instrument = readSettings('instrument')
                        p.extension = 5000
                        this.channel.write( p )
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

                case cl.helpers.package.agent.setstate.id:
                        Trace("Set state "+package.code)
                        proceedState(package.code)
                    break
                case cl.helpers.package.call.begin.id:
                    ui.showDialScreen('Incomming call from <a href="'
                        + incommingCallUrl.replace('%device%', package.device).replace('%number%', package.number)
                        +'" id="open_browser">'+package.number + '</a>')
                    break

                case cl.helpers.package.service.buttonmask.id:

                    var ENABLE_ANSWER = 1
                    , ENABLE_CLEAR = 16
                    , ENABLE_CONFERENCE_COMPLETE = 512
                    , ENABLE_CONFERENCE_INIT = 256
                    , ENABLE_HOLD =  4
                    , ENABLE_LOGIN = 16777216
                    , ENABLE_LOGOUT = 33554432
                    , ENABLE_LOGOUT_WITH_REASON = 67108864
                    , ENABLE_MAKECALL = 16
                    , ENABLE_NOTREADY = 268435456
                    , ENABLE_NOTREADY_WITH_REASON = 536870912
                    , ENABLE_READY = 134217728
                    , ENABLE_RELEASE = 2
                    , ENABLE_RETRIEVE = 8
                    , ENABLE_SINGLE_STEP_TRANSFER = 128
                    , ENABLE_SINGLE_STEP_CONFERENCE = 1024
                    , ENABLE_TRANSFER_COMPLETE = 64
                    , ENABLE_TRANSFER_INIT = 32
                    if( (package.mask & ENABLE_ANSWER) != 0 )
                        State.setReserved()
                    //if( (package.mask & ENABLE_RELEASE) != 0 )
                    //    State.setReserved()

                    break
                case cl.helpers.package.agent.setstate.id:
                        Trace("Set state '"+ cl.state.byID(package.code).name + "'")
                    break
                case cl.helpers.package.call.established.id:
                    break
                case cl.helpers.package.call.hold.id:
                    break
                case cl.helpers.package.call.unhold.id:
                    break
                default:
                    Trace("Package " + package.getName() + " does not proceeded")
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
    return new wrk
}()

//a.set-state-connect


// $(function(){
//     var c = new nsock( { host: '127.0.0.1', port: 32562}, [
//     	new worker()
//         , new (cl.handlers.encoder)()
//         , new (cl.handlers.decoder)()
//     ])
// })
// Init state switch listeners
$(function(){
    // State events listeners
    State.addEventListener( State.ON_OFFLINE, function(){
        State.setWait()
        worker.disconnect()
    })
    // State events listeners
    State.addEventListener( State.ON_CONNECT, function(){
        State.setWait()
        worker.connect()
    })
    State.addEventListener( State.ON_READY, function(){
        State.setWait()
        worker.setState( 'available' )
    })
    State.addEventListener( State.ON_BUSY, function(){
        State.setWait()
        worker.setState( 'notReady' )
    })
    State.addEventListener( State.ON_ANSWER, function(){
        State.setWait()
        worker.callAnswer()
    })
    State.addEventListener( State.ON_REJECT, function(){
        State.setWait()
        worker.callRelease()
    })
    State.addEventListener( State.ON_HOLD, function(){
        State.setWait()
        worker.callHold()
    })
    State.addEventListener( State.ON_UNHOLD, function(){
        State.setWait()
        worker.callUnhold()
    })
    // END State events listeners
    State.setOffline()
    State.setWait()
    worker.connect()
})

function proceedState(state){
    switch(state){
        case cl.state.logout.id:
        case cl.state.unknown.id:
                State.setOffline()
                //State.setBusy()
            break;
        case cl.state.available.id:
                State.setReady()
                ui.showMainScreen()
            break;
        case cl.state.workReady.id:
        case cl.state.notReady.id:
        case cl.state.workNotReady.id:
                Trace("Set state ready")
                State.setBusy()
                ui.showMainScreen()
            break;
        case cl.state.talking.id:
            State.setTalking()
            break;
        case cl.state.reserved.id:
            State.setReserved()
        case cl.state.hold.id:
            State.setHold()
        default:
            Trace("Unknown state")
    }
    State.enable()
}




function Quit() {
    var event = new air.Event(air.Event.EXITING, false, true);
    air.NativeApplication.nativeApplication.dispatchEvent(event);
    if (!event.isDefaultPrevented()) {
        air.NativeApplication.nativeApplication.exit();
    }
}