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
      //call packery only here so that it only rerenders on size change
    	editor.resize();
    }
	}
	hug();
	editor.renderer.$gutterLayer._eventRegistry.changeGutterWidth.push(hug);
	editor.getSession().on('change', hug);
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

SubsetRenderer.prototype.renderSingle = function(subObj, idNum){
  this.RenderSubsetElement(
    subObj,
    false,
    idNum
  );
};

SubsetRenderer.prototype.removeSingle = function(subIdNum){
  document.body.removeChild(
    document.getElementById(
      subIdNum + SUBSET_ID_SUFFIX
    )
  );
};

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

  subObj.idNum = subNumber;
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
  this.super();
  this.groups = {};
  this.subToGroupIndex = {};
  this.idCount = 0;
}.extends(EventEmitter);

SubsetModel.prototype.addSubset = function(subObj) {
	var groupName = subObj.fileName;
  this.idCount++;
  if(!this.groups[groupName]){
    this.groups[groupName] = new SubsetGroup(groupName);
  }
  this.groups[groupName].addSubset(subObj);
  this.subToGroupIndex[this.idCount] = groupName;
  this.emit('add_subset', subObj); 
};
  
SubsetModel.prototype.removeSubset = function(subIdNum){
  var groupName = this.subToGroupIndex[subIdNum];
  delete this.subToGroupIndex[subIdNum];
  this.groups[groupName].removeSubset(subIdNum);
  this.emit('remove_subset', subIdNum);
}

// SubsetModel.prototype.saveSubset = function(id, newValue) {
//   // body...
//   this.emit('save_subset', id);
// };

SubsetModel.prototype.getSubsetGroup = function(fileName){
  return this.groups[fileName];
};

/////////////
// Subset  //
/////////////

var Subset = function(initObj){
  //set by gui
	this.editor = null;
  this.offset = 0;
  this.idNum  = 0;

  //sent from server
  this.fileName = '';
	this.codeSubset = '';
  this.startLength = 0;
  this.buffIndex = 0;

  this.consume(initObj);
};

/////////////////
// SubsetGroup //
/////////////////

var SubsetGroup = function(fileName){
	this.fileName = fileName;
  this.subsets = [];
};

SubsetGroup.prototype.addSubset = function(subObj){
  this.subsets.push(subObj);
  this.subsets.sort(function(curr, next){
    if(curr.buffIndex < next.buffIndex){
      return 1;
    }
    else if(curr.buffIndex > next.buffIndex){
      return -1;
    }
    return 0;
  });
};

SubsetGroup.prototype.removeSubset = function(subIdNum){
  for (var i = 0; i < this.subsets.length; i ++){
    if(subIdNum == this.subsets[i].idNum){
      this.subsets.splice(i, 1);
      return;
    }
  }
};

/////////////////
//  SubsetApp  //
/////////////////

SubsetApp = function(){
  this.renderer = new SubsetRenderer();
  this.model    = new SubsetModel();
  this.socket   = new SmartSocket('localhost', 8001, '/socket');
  this.setupRenderModelListeners(this.renderer, this.model);
}

SubsetApp.prototype.registerSocketListener = function(event, handler) {
  this.socket.on(event, handler, this);
};

SubsetApp.prototype.unregisterSocketListener = function(event, handler) {
  this.socket.off(event, handler, this);
};

SubsetApp.prototype.setupRenderModelListeners = function(rend, model){
  
  model.on('add_subset', function(subObj){
    var group = model.getSubsetGroup(subObj.fileName);
    rend.renderSingle(subObj, model.idCount);
  });

  model.on('remove_subset', function(subIdNum){
    rend.removeSingle(subIdNum);
  });
}

/**
 * TESTING
 */
var group = {fileName : 'trial.txt'},
	mockSubsets = [{
		fileName : '1.txt',
    buffIndex : 32,
		codeSubset : "function quantify_(sifter){\n\tif(sifter.infinite_){\n\t\tsifter.regEx_ += sifter.infinite_;\n\t\tsifter.infinite_ = null;\n\t}\n\telse if(sifter.atLeastOne_){\n\t\tsifter.regEx_ += sifter.atLeastOne_;\n\t\tsifter.atLeastOne_ = null;\n\t}\n\telse if(sifter.zeroOrOne_){\n\t\tsifter.regEx_ += sifter.zeroOrOne_;\n\t\tsifter.zeroOrOne_ = null;\n\t}\n\telse if(sifter.exactly_){\n\t\tsifter.regEx_ += '{' + sifter.exactly_ + '}';\n\t\tsifter.exactly_ = null;\n\t}\n\telse if(sifter.between_){\n\t\tsifter.regEx_ += '{' + sifter.between_.start_ +\n\t\t\t',' + sifter.between_.end_ + '}';\n\t\tsifter.between_ = null;\n\t}\n}"
	},
	{
		fileName : '1.txt',
    buffIndex : 64,
		codeSubset : "Sifter.prototype.captures = function(expFunc, name, autoRegister) {\n\tif(typeof expFunc !== 'function'){\n\t\tthrow 'captures() arguments must be of type \"function\".';\n\t}\n\tvar exp;\n\tthis.captured.push(name);\n\texp = resolveExp_(expFunc);\n\tthis.regEx_ += '(' + exp + ')';\n\tquantify_(this);\n\tif(autoRegister){\n\t\tthis.registerNamedCapture(name, exp);\n\t}\n\treturn this;\n};"
	},
  {
    fileName : '1.txt',
    buffIndex : 32,
    codeSubset : "function quantify_(sifter){\n\tif(sifter.infinite_){\n\t\tsifter.regEx_ += sifter.infinite_;\n\t\tsifter.infinite_ = null;\n\t}\n\telse if(sifter.atLeastOne_){\n\t\tsifter.regEx_ += sifter.atLeastOne_;\n\t\tsifter.atLeastOne_ = null;\n\t}\n\telse if(sifter.zeroOrOne_){\n\t\tsifter.regEx_ += sifter.zeroOrOne_;\n\t\tsifter.zeroOrOne_ = null;\n\t}\n\telse if(sifter.exactly_){\n\t\tsifter.regEx_ += '{' + sifter.exactly_ + '}';\n\t\tsifter.exactly_ = null;\n\t}\n\telse if(sifter.between_){\n\t\tsifter.regEx_ += '{' + sifter.between_.start_ +\n\t\t\t',' + sifter.between_.end_ + '}';\n\t\tsifter.between_ = null;\n\t}\n}"
  }];

app = new SubsetApp();

for (var i = 0; i < mockSubsets.length; i++){
  var sub = new Subset(mockSubsets[i]);
  app.model.addSubset(sub);
}

setTimeout(function(){
  app.model.removeSubset('1');
}, 3000);

app.registerSocketListener('trial', function(data){
  console.log('from trial event: ' + data);
  console.log(this);
});

var newsubset = function(data){
  console.log(data);
};

app.registerSocketListener('new-subset', newsubset);
app.registerSocketListener('new-subset', function(){});

app.unregisterSocketListener('new-subset', newsubset);


//make LayoutManager for the renderer
  //comeup with algorithm for placing subsets in different spots...what happens when they overun eachother when you are editing them?
//dynamically change outline colors


}