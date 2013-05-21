window.onload = function(){

/////////////
// Helpers //
/////////////
var make = function(elementType, clazz, id, text){
	var elem = document.createElement(elementType);
	if(clazz){
		elem.setAttribute('class', clazz);
	}
	if(id){
		elem.setAttribute('id', id);
	}
	if(text){
		elem.innerText = text;
	}
	return elem;
},

makeHuggable = function(editor){
	var hug = function(){
		var id, oldHeight, newHeight, oldWidth, newWidth, editorElem, ctrlElem, subElem, resize;

		resize = false;
		id = editor.container.id;
		editorElem = editor.container;
    ctrlElem   = document.getElementById(id.split('-')[0] + SUBSET_CONTROLS_ID_SUFFIX);
    subElem    = document.getElementById(id.split('-')[0] + SUBSET_ID_SUFFIX);

    oldHeight = parseInt(editorElem.style.height);
		newHeight = editor.getSession().getScreenLength() * editor.renderer.lineHeight;

  	oldWidth = parseInt(editorElem.style.width);
    newWidth = (editor.getSession().getScreenWidth()
      * editor.renderer.$textLayer.$characterSize.width)
      + editor.renderer.$gutterLayer.gutterWidth + 10;

    if(isNaN(oldHeight) || oldHeight != newHeight){
    	editorElem.style.height = newHeight + 'px';
    	resize = true;
		}

    if(isNaN(oldWidth) || oldWidth != newWidth){
        editorElem.style.width  = newWidth + 'px';
        ctrlElem.style.width    = newWidth + 'px';
        subElem.style.width     = newWidth + 'px';
        resize = true;
    }

    if(resize){
    	editor.resize();
    }
	}
	hug();
	editor.renderer.$gutterLayer._eventRegistry.changeGutterWidth.push(hug);
	editor.getSession().on('change', hug);
},

xtends = function(ctx, zuper){
  ctx.__proto__.__proto__ = new zuper();
};

///////////////////////
// SubsetRenderer //
///////////////////////
var SUBSET_GROUP_ID_SUFFIX       = '-SG',
	SUBSET_GROUP_HEADER_ID_SUFFIX  = '-SGH',
	SUBSET_GROUP_CONTENT_ID_SUFFIX = '-SGC',
	SUBSET_EDITOR_ID_SUFFIX        = '-SEDITOR',
	SUBSET_BUTTON_ID_SUFFIX        = '-SBTN',
	SUBSET_CONTROLS_ID_SUFFIX      = '-SCNTRL',
	SUBSET_LAST_CLASS_SUFFIX       = '-last',
	SUBSET_ID_SUFFIX               = '-S';

var SubsetRenderer = function(){};

SubsetRenderer.prototype.hardRender = function(model){
  var subsets, subsetElem;

  subsets = model.subsets;
  for(var i = 0; i < subsets.length; i++){
    this.RenderSubsetElement(
      subsets[i],
      false,
      i     
    );
  }
}

SubsetRenderer.prototype.RenderSubsetElement = function(subObj, last, subNumber) {
	var subElem, buttonGroup, subsetEditor;
	subElem = make(
		'div',
		last? 'subset' + SUBSET_LAST_CLASS_SUFFIX : 'subset',
		subNumber + SUBSET_ID_SUFFIX
	);

	buttonGroup = this.createButtonGroup(
		'subset-controls', 
		subNumber,
		[
			'Save',
			'Fold',
			'Split'
		]
	);

	subsetEditor = make(
		'div',
		'subset-editor',
		subNumber + '-' + subObj.fileName + SUBSET_EDITOR_ID_SUFFIX
	);

	subElem.appendChild(buttonGroup);
	subElem.appendChild(subsetEditor);

  document.body.appendChild(subElem);

  subObj.editor = this.createSubsetContent(
    subNumber + '-' + subObj.fileName + SUBSET_EDITOR_ID_SUFFIX, 
    subObj
  );
};

SubsetRenderer.prototype.createButtonGroup = function(groupClass, id, labels) {
	var buttonGroup, tempButton;

	buttonGroup = make(
		'div',
		'btn-group ' + groupClass,
		id + SUBSET_CONTROLS_ID_SUFFIX
	);

	for(var i = 0; i < labels.length; i++){
		tempButton = this.createButton(
			labels[i],
			id + '-' + i
		);
		buttonGroup.appendChild(tempButton);
	}

	return buttonGroup;
};

SubsetRenderer.prototype.createButton = function(label, id) {
	var button;

	button = make(
		'button',
		'styled-button',
		id + SUBSET_BUTTON_ID_SUFFIX
	);

	button.innerHTML = label;

	return button;
};

SubsetRenderer.prototype.createSubsetContent = function(subElemId, subObj) {
	var editor;

	editor = ace.edit(subElemId);
	editor.setTheme('ace/theme/monokai');
	editor.getSession().setMode('ace/mode/javascript');
	editor.setValue(subObj.codeSubset, -1);
	makeHuggable(editor);

	return editor;
};

///////////////////////
// SubsetModel       //
///////////////////////

var SubsetModel = function(){
  xtends(this, EventEmitter);

};

SubsetModel.prototype.addSubset = function(subObj) {
	// body...
};

/////////////
// Subset  //
/////////////

var Subset = function(initObj){
	this.editor = null;
	this.codeSubset = initObj.codeSubset? initObj.codeSubset : ''; 
};

/////////////////
// SubsetGroup //
/////////////////

var SubsetGroup = function(initObj){
	this.fileName = initObj.fileName? initObj.fileName : '';
  this.subsets = [];
};

//////////////////
// EventEmitter //
//////////////////
var EventEmitter = function(){
  this.registeredListeners = {};
};

EventEmitter.prototype.on = function(type, cb, optCtx) {
  if(this.registeredListeners.hasOwnProperty(type)){
    this.registeredListeners[type].push({
      'context' : (optCtx ? optCtx : this),
      'handler' : cb 
    });
    return;
  }
  this.registeredListeners[type] = [];
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

// EventEmitter.prototype.registeredListeners = {};

/////////////////
// SmartSocket //
/////////////////

var SmartSocket = function(domainStr, portStr, opt_path){
  xtends(this, EventEmitter);
	var path = opt_path ? opt_path : '';
	this.socket = new WebSocket(
		'ws://' + domainStr + ":" + portStr + path
	);
	this.socket.onmessage = this.onmessage.bind(this);
};

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

/////////////////
//  SubsetApp  //
/////////////////

SubsetApp = function(){
  this.renderer = new SubsetRenderer();
  this.model    = new SubsetModel();
  this.socket   = new SmartSocket('localhost', 8001, '/socket');
}

SubsetApp.prototype.registerSocketListener = function(event, handler) {
  this.socket.on(event, handler, this);
};

SubsetApp.prototype.unregisterSocketListener = function(event, handler) {
  this.socket.off(event, handler, this);
};

/**
 * TESTING
 */
var group = {fileName : 'trial.txt'},
	subsets = [{
		fileName : '1.txt',
		codeSubset : "function quantify_(sifter){\n\tif(sifter.infinite_){\n\t\tsifter.regEx_ += sifter.infinite_;\n\t\tsifter.infinite_ = null;\n\t}\n\telse if(sifter.atLeastOne_){\n\t\tsifter.regEx_ += sifter.atLeastOne_;\n\t\tsifter.atLeastOne_ = null;\n\t}\n\telse if(sifter.zeroOrOne_){\n\t\tsifter.regEx_ += sifter.zeroOrOne_;\n\t\tsifter.zeroOrOne_ = null;\n\t}\n\telse if(sifter.exactly_){\n\t\tsifter.regEx_ += '{' + sifter.exactly_ + '}';\n\t\tsifter.exactly_ = null;\n\t}\n\telse if(sifter.between_){\n\t\tsifter.regEx_ += '{' + sifter.between_.start_ +\n\t\t\t',' + sifter.between_.end_ + '}';\n\t\tsifter.between_ = null;\n\t}\n}"
	},
	{
		fileName : '2.txt',
		codeSubset : "Sifter.prototype.captures = function(expFunc, name, autoRegister) {\n\tif(typeof expFunc !== 'function'){\n\t\tthrow 'captures() arguments must be of type \"function\".';\n\t}\n\tvar exp;\n\tthis.captured.push(name);\n\texp = resolveExp_(expFunc);\n\tthis.regEx_ += '(' + exp + ')';\n\tquantify_(this);\n\tif(autoRegister){\n\t\tthis.registerNamedCapture(name, exp);\n\t}\n\treturn this;\n};"
	}];

Subset = new SubsetApp();
Subset.renderer.hardRender({
    'subsets' : subsets
});

Subset.registerSocketListener('trial', function(data){
  console.log('from trial event: ' + data);
  console.log(this);
});

var newsubset = function(data){
  console.log(data);
};

Subset.registerSocketListener('new-subset', newsubset);
Subset.registerSocketListener('new-subset', function(){});

Subset.unregisterSocketListener('new-subset', newsubset);

//create model with event hooks...write out project spec for sanity
//make LayoutManager for the renderer
  //comeup with algorithm for placing subsets in different spots...what happens when they overun eachother when you are editing them?
//dynamically change outline colors


}