var jorge = jorge || {
	id: '',
	id_record: '',
	recording: false,
    debugMode: true,
    server: 'http://localhost:3000/',
	ajaxListener: undefined,
	watchAjax: false,
	watchEvents: false,
    log: function(msg) {
        if (this.debMode) {
            console.log(msg);
        }
        this.sendLog(msg);
    },
    warn: function(msg) {
        if (this.debMode) {
            console.warn(msg);
        }
        this.sendLog(msg);
    },
    error: function(msg) {
        if (this.debMode) {
            console.error(msg);
        }
        this.sendLog(msg);
    },
    sendLog: function(msg) {
		return this.request('POST', this.server + 'sendLog/', { file: this.id, msg: msg }); //[]
    },
	request: function(type, url, data, callback){
		data = data || null;
		callback = callback || function(){};
		var xhReq = new XMLHttpRequest();
		xhReq.open(type, url, true);
		xhReq.send(data);
		xhReq.onreadystatechange = function(){
			if(xhReq.readyState === 4)
				callback(xhReq.responseText);
		};
	},
    repeatAfterMe: function(file) {
		this.request('POST', this.server + 'getSteps/', { file: file }, function(steps){ this.doStep(steps, 0); });
    },
	doStep: function (steps, i){
		if(i < steps.length){
			//TODO: Do step then call next.
			this.log("Do step: " + steps[i]);
			doStep(steps, ++i);
		}
	},
	newGUID: function () {
	  var s4 = function s4() { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
	  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	setId: function(){
		if (typeof(Storage) !== "undefined") {
			// Code for localStorage/sessionStorage.
			this.id = localStorage.getItem("JORGE_ID");
			if(this.id == undefined || this.id == null){
				this.id = this.newGUID();
				localStorage.setItem("JORGE_ID", this.id);
			}
		}else{
			this.id = this.newGUID();
			this.log('Sorry! No Web Storage support..');
		}
	},
	setAjaxListner: function(){
		this.ajaxListener = new Object();

		// Added for IE support
		if (typeof XMLHttpRequest === "undefined") {
			XMLHttpRequest = function () {
				try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); }
				catch (e) {}
				try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); }
				catch (e) {}
				try { return new ActiveXObject("Microsoft.XMLHTTP"); }
				catch (e) {}
				throw new Error("This browser does not support XMLHttpRequest.");
			};
		}

		this.ajaxListener.tempOpen = XMLHttpRequest.prototype.open;
		this.ajaxListener.tempSend = XMLHttpRequest.prototype.send;
		this.ajaxListener.callback = function () {
			// this.method :the ajax method used
			// this.url    :the url of the requested script (including query string, if any) (urlencoded) 
			// this.data   :the data sent, if any ex: foo=bar&a=b (urlencoded)
			jorge.log({ method: this.method, url: this.url, data: this.data  });
		}
		
		
		XMLHttpRequest.prototype.open = function(a,b) {
			if (!a) var a='';
			if (!b) var b='';
			this.ajaxListener.tempOpen.apply(this, arguments);
			this.ajaxListener.method = a;  
			this.ajaxListener.url = b;
			if (a.toLowerCase() == 'get') {
			  this.ajaxListener.data = b.split('?');
			  this.ajaxListener.data = this.ajaxListener.data[1];
			}
	  }

	  XMLHttpRequest.prototype.send = function(a,b) {
		if (!a) var a='';
		if (!b) var b='';
		this.ajaxListener.tempSend.apply(this, arguments);
		if(this.ajaxListener.method.toLowerCase() == 'post')this.ajaxListener.data = a;
		this.ajaxListener.callback();
	  }
	},
	setDefaults: function(options){
		options = options || {};
		this.watchAjax = options.watchAjax !==undefined ? options.watchAjax : this.watchAjax;
		this.watchEvents = options.watchEvents !==undefined ? options.watchEvents : this.watchEvents;
	},
	init: function(options){
		
		this.setDefaults(options);
		
		//Generate an id
		this.setId();
		
		//Ajax
		if(this.watchAjax)
			this.setAjaxListner();
		
		//Get window error
		window.onerror = function(error, url, line) {
			this.error(JSON.stringify({acc:'error', data:'ERR:'+error+' URL:'+url+' L:'+line}));
		};
		
		//Atach event listners
		//click, change, keyup, etc...
		if(this.watchEvents){
			
		}
		
		
	}	
};






  