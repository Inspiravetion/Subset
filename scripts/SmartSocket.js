var SmartSocket = function(domainStr, portStr, opt_path){
  this.super();
	var path = opt_path ? opt_path : '';
	this.socket = new WebSocket(
		'ws://' + domainStr + ":" + portStr + path
	);
	this.socket.onmessage = this.onmessage.bind(this);
}.extends(EventEmitter);

SmartSocket.prototype.onmessage = function(message){
	var parsedMsg, evnt;

	parsedMsg = JSON.parse(message.data);

	if(this.registeredListeners.hasOwnProperty(parsedMsg.type)){
		var callbacks = this.registeredListeners[parsedMsg.type];
		for(var i = 0; i < callbacks.length; i++){
      evnt = callbacks[i];
      evnt.handler.call(evnt.context, parsedMsg.message);
		}
		return;
	}
	console.log('Sent data with unregistered type of message.');
}

SmartSocket.prototype.emit = function(type, message) {
	this.socket.send(JSON.stringify({
		type : type,
		message : message
	}));
};