var EventEmitter = function(){
  this.registeredListeners = {};
};

EventEmitter.prototype.on = function(type, cb, optCtx) {
  if(!this.registeredListeners.hasOwnProperty(type)){
    this.registeredListeners[type] = [];
  }
  this.registeredListeners[type].push({
      'context' : (optCtx ? optCtx : this),
      'handler' : cb 
  });
};

EventEmitter.prototype.off = function(type, cb, optCtx) {
  var handlers;
  optCtx = optCtx ? optCtx : this;
  if(this.registeredListeners.hasOwnProperty(type)){
    if(!cb){
      delete this.registeredListeners[type];
      return;
    }
    handlers = this.registeredListeners[type];
    for(var i = 0; i < handlers.length; i ++){
      if(handlers[i].context == optCtx && handlers[i].handler == cb){
        handlers.splice(i, 1);
        break;
      }
    }
    if(handlers.length == 0){
      delete this.registeredListeners[type];
    }
  }
};

EventEmitter.prototype.emit = function(type, data) {
  var handlers, evnt;
  if(this.registeredListeners.hasOwnProperty(type)){
    handlers = this.registeredListeners[type];
    for(var i = 0; i < handlers.length; i ++){
      evnt = handlers[i];
      evnt.handler.call(evnt.context, data);
    }
  }
};