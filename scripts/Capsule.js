Object.defineProperty( Object.prototype, 'consume', {
  value: function(other, mutate, global){
    var propExists;
    if(typeof mutate != 'function'){
      global = global || mutate;
      mutate = null;
    }
    if(global){
      propExists = Object.hasProperty.bind(this);
    }
    else{
      propExists = Object.hasOwnProperty.bind(this);
    }
    other.projectOnto(this, {
      filter : propExists,
      mutate : mutate
    });
  },
  enumerable: false
});

Object.defineProperty( Object.prototype, 'projectOnto', {
  value: function(to, opt){
    var newProp, filter, mutate;
    opt = opt || {};
    filter = opt.filter || (function(){ return true });
    mutate = opt.mutate || (function(d){ return d });
    for(p in this){
      if(filter.call(this, p)){
        to[p] = mutate(this[p]);  
      }
    }
  },
  enumerable: false
});

Object.defineProperty( Object.prototype, 'hasProperty', {
  value: function(prop){
    return (prop in this);
  },
  enumerable: false
});

Object.defineProperty( Object.prototype, 'extends', {
  value: function(superClass){
    this.prototype = new superClass();
    Object.defineProperty(this.prototype, '__super__', {
      value : superClass,
      enumerable : false
    });
    return this;
  },
  enumerable: false
});

Object.defineProperty( Object.prototype, 'super', {
  value: function(args){
    if(this.__proto__.__super__){
      this.__proto__.__super__.apply(this, args);
    }
  },
  enumerable: false
});

Object.defineProperty( Object.prototype, 'implements', { 
  value: function(nterface){
    for(property in nterface){
      if(property == 'abstract'){
        nterface[property].projectOnto(this.prototype);
      }
      else{
        var obj = { p : property };
        Object.defineProperty(this.prototype, property, { 
          get : function(){
            throw 'Error: attempting to access unimplemented interface property ' + this.p + '.';
          }.bind(obj),
          set : function(value){
            if( typeof value != nterface[property] ){
              throw 'Error: attempting to set interface property ' + this.p + ' with incorrect type';
            }
            return value;
          }.bind(obj)
        });
      }
    }
    return this;
  },
  enumerable: false
});