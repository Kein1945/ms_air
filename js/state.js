// CtiOsEnums.java AgentState
// 			public static final int eLogin = 0;
//         public static final int eLogout = 1;
//         public static final int eNotReady = 2;
//         public static final int eAvailable = 3;
//         public static final int eTalking = 4;
//         public static final int eWorkNotReady = 5;
//         public static final int eWorkReady = 6;
//         public static final int eBusyOther = 7;
//         public static final int eReserved = 8;
//         public static final int eUnknown = 9;
//         public static final int eHold = 10;

(function(){
	var StateObject = function(){
		var self = this
		this.options = {}
		this.options.items = {
			offline: { // Availiable for switch
				label: { short: 'Отключиться', normal: 'Не в сети' }
				, icon : 'icon-off'
				, colorClass : ''
				, listenEventClass: 'set-state-offline'
			}
			, disconnected: {
				label: { short: '', normal: 'Отключен' }
				, icon : 'icon-exclamation-sign icon-white'
				, colorClass : 'btn-danger'
				, listenEventClass: ''
			}
			, connect: {
				label: { short: 'Подключиться', normal: '' }
				, icon : 'icon-share', colorClass : '', listenEventClass: 'set-state-connect'
			}
			, ready: { // Availiable for switch
				label: { short: 'Готов', normal: 'Готов (<strong>%s%</strong>)' }
				, icon : 'icon-ok-circle'
				, colorClass : 'btn-success'
				, listenEventClass: 'set-state-ready'
			}
			, busy: { // Availiable for switch
				label: { short: 'Не готов', normal: 'Не готов (<strong>%s%</strong>)' }
				, icon : 'icon-time'
				, colorClass : 'btn-warning'
				, listenEventClass: 'set-state-busy'
			}
			, reserved: {
				label: { short: '', normal: 'входящий' }
				, icon : 'icon-headphones icon-white'
				, colorClass : 'btn-info'
				, listenEventClass: ''
			}
			, reject: { // Availiable for switch
				label: { short: 'Отклонить', normal: '' }
				, icon : 'icon-minus'
				, colorClass : ''
				, listenEventClass: 'set-state-reject'
			}
			, answer: { // Availiable for switch
				label: { short: 'Ответить', normal: '' }
				, icon : 'icon-share-alt'
				, colorClass : ''
				, listenEventClass: 'set-state-answer'
			}
			, talking: {
				label: { short: '', normal: 'Разговор (<strong>%s%</strong>)' }
				, icon : 'icon-headphones icon-white'
				, colorClass : 'btn-primary'
				, listenEventClass: ''
			}
			, clear: { // Availiable for switch
				label: { short: 'Прервать', normal: '' }
				, icon : 'icon-stop', colorClass : ''
				, listenEventClass: 'set-state-stop'
			}
			, workready: {
				label: { short: '', normal: 'Занят (<strong>%s%</strong>)' }
				, icon : 'icon-time'
				, colorClass : 'btn-warning'
				, listenEventClass: ''
			}
			, wait: {
				label: { short: '', normal: 'Подождите' }
				, icon : 'icon-repeat'
				, colorClass : ''
				, listenEventClass: ''
			}
			, hold: { // Availiable for switch
				label: { short: 'Приостановить', normal: 'Приостановлен' }
				, icon : 'icon-pause'
				, colorClass : ''
				, listenEventClass: 'set-state-hold'
			}
			, unhold: { // Availiable for switch
				label: { short: 'Возобновить', normal: 'Подождите' }
				, icon : 'icon-play'
				, colorClass : ''
				, listenEventClass: 'set-state-unhold'
			}
		}
		this.options.ctiState = {
			login : { label: 'Login?', id: 0, name: 'login' }
			, logout : { label: 'Logout?', id: 1, name: 'logout' }
			, notReady : { label: 'Not ready', id: 2, name: 'notReady' }
			, available : { label: 'Avaliable', id: 3, name: 'available' }
			, talking : { label: 'Talinkg', id: 4, name: 'talking' }
			, workNotReady : { label: 'Work not ready', id: 5, name: 'workNotReady' }
			, workReady : { label: 'Work ready', id: 6, name: 'workReady' }
			, busyOther : { label: 'Busy other', id: 7, name: 'busyOther' }
			, reserved : { label: 'Reserved', id: 8, name: 'reserved' }
			, unknown : { label: 'Unknown', id: 9, name: 'unknown' }
			, hold : { label: 'Hold', id: 10, name: 'hold' }
		}
		this.div = $('#state')
		this.indicator = {
				button: this.div.find('a.btn')
				, label: this.div.find('a.btn span.ilabel')
				, icon: this.div.find('a.btn i')
			}
		this.stateMenu = this.div.find('ul.dropdown-menu')
		this.infoLabel = $('#info')

		// Events
		this.listeners = {}
		this.ON_OFFLINE = 1
		this.ON_READY = 2
		this.ON_BUSY = 3
		this.ON_STOP = 4
		this.ON_UNHOLD = 5
		this.ON_HOLD = 6
		this.ON_CONNECT = 7
		this.ON_REJECT = 8
		this.ON_ANSWER = 9
		this.currentState = 'offline'
	}
	StateObject.prototype = {
		getStateById : function(id){
			for (var name in this.options.ctiState){
				if ( id == this.options.ctiState[name].id)
					return this.options.ctiState[name]
			}
			Trace('GetStateById: Unknown state '+id)
		}
		, getStateByName : function(name){
			if (typeof(this.options.ctiState[name]) != 'undefined')
				return this.options.ctiState[name]
		}
		, getItemConf : function(name){
			if( this.options.items[name] )
				return this.options.items[name]
			else
				Trace('Unknown options state "'+name)
				return { label: { short: 'Ошибка '+name, normal: 'Ошибка '+name }, icon : 'icon-question-sign', colorClass : '', listenEventClass: ''}
		}
		/**
		 * Выставляет значение выдимого индикатора
		 */
		, setIndicator : function(name){
			var stateItemConf = this.getItemConf(name)
			this.currentState = name
			this.indicator.label.html( stateItemConf.label.normal )
			this.indicator.icon.removeClass().addClass( stateItemConf.icon )
			this.indicator.button.removeClass('btn-success btn-primary btn-danger btn-warning btn-info').addClass( stateItemConf.colorClass )
		}

		/**
		 * Выставляет допустимые пункты в выпадающем списке
		 */
		, setAvaliableState : function(current, avaliable){
			this.stateMenu.html('')
			for (var i in avaliable){
				var stateName = avaliable[i]
				if( '|' == stateName ){
					this.stateMenu.append($('<li></li>').addClass('divider'))
				} else {
					var stateItemConf = this.getItemConf(avaliable[i])
					this.stateMenu.append(
						$('<li></li>').append(
							$('<a></a>').addClass( stateItemConf.listenEventClass ).html( stateItemConf.label.short )
								.prepend( $('<i></i>').addClass( stateItemConf.icon ) )
						).addClass( (current == stateName)? 'active': '')
					)
				}
				
			}
		}

		/* Логика для каждого события */
		, setOffline : function(){
			this.setIndicator('offline')
			this.setAvaliableState('offline', ['connect', '|','offline'] )
			this.startTimer('badge-offline')
			this.enable()
		}

		, setReady : function(){
			this.setIndicator('ready')
			this.setAvaliableState('ready', ['ready', 'busy', '|', 'offline'] )
			this.startTimer('badge-success')
			this.enable()
		}

		, setBusy : function(){
			this.setIndicator('busy')
			this.setAvaliableState('busy', ['ready', 'busy', '|', 'offline'] )
			this.startTimer('badge-warning')
			this.enable()
		}

		,setReserved : function(){
			this.setIndicator('reserved')
			this.setAvaliableState('none', ['answer', 'reject'] )
			//this.startTimer('badge-info')
			this.disable()

		}
		, setTalking : function(){
			this.setIndicator('talking')
			this.setAvaliableState('none', ['hold','clear'] )
			this.startTimer('badge-info')
			this.enable()
		}
		, setHold : function(){
			this.setIndicator('hold')
			this.setAvaliableState('none', ['unhold', 'reject'] )
			//this.startTimer('badge-info')
			this.disable()

		}
		, setDisconnected : function(reason){
			this.setIndicator('disconnected')
			this.setAvaliableState('offline', ['connect', '|', 'offline'] )
			this.setInfo(reason, 'badge-error')
			this.enable()
		}

		, setWait : function(reason){
			this.disable()
			this.setIndicator('wait')
			this.setAvaliableState('wait', [] )
			this.setInfo(reason, 'badge-info')
		}

		, disable : function(){
			this.indicator.button.addClass('disabled')
		}
		, enable : function(){
			this.indicator.button.removeClass('disabled')
		}

		, setInfo : function(text, className){
			this.stopTimer()
			className = className || 'badge-inverse'
			this.infoLabel.removeClass().addClass('badge '+className)
			this.infoLabel.html(text)
		}
		, startTimer : function(className){
			this.infoLabel.removeClass().addClass('badge '+ (className || 'badge-inverse'))
			var currentTimer = this.currentTimer = (new Date()).getTime()
				, self = this
				, second = 0;
			(function(){
				if (self.currentTimer != currentTimer) return
				setTimeout(arguments.callee, 1000)
				self.indicator.label.html( self.getItemConf( self.currentState ).label.normal.replace('%s%', Math.floor( second++ / 60) + ':' + ( second % 60 )) )
				//self.infoLabel.html( Math.floor( second++ / 60) + ':' + ( second % 60 ) )
			})()
		}
		, stopTimer : function(){
			this.currentTimer = (new Date()).getTime()
		}

		, addEventListener : function(type, callback){
			if( !this.listeners[type] ) this.listeners[type] = []
			this.listeners[type][ this.listeners[type].length ] = callback
		}
		, fireEvent: function(type, event){
			event = event || {}
			if( this.listeners[type] )
				for (var i in this.listeners[type])
					if ( false === this.listeners[type][i]( event ) )
						return false
			return true
		}

	}
	$(function(){
		window['State'] = new StateObject()
		$('a.set-state-offline').live('click', function(){
			State.fireEvent(State.ON_OFFLINE)
		})
		$('a.set-state-ready').live('click', function(){
			State.fireEvent(State.ON_READY)
		})
		$('a.set-state-busy').live('click', function(){
			State.fireEvent(State.ON_BUSY)
		})
		$('a.set-state-stop').live('click', function(){
			State.fireEvent(State.ON_STOP)
		})
		$('a.set-state-connect').live('click', function(){
			State.fireEvent(State.ON_CONNECT)
		})
		$('a.set-state-hold').live('click', function(){
			State.fireEvent(State.ON_HOLD)
		})
		$('a.set-state-unhold').live('click', function(){
			State.fireEvent(State.ON_UNHOLD)
		})
		$('a.set-state-answer').live('click', function(){
			State.fireEvent(State.ON_ANSWER)
		})
		$('a.set-state-reject').live('click', function(){
			State.fireEvent(State.ON_REJECT)
		})
	})
})()