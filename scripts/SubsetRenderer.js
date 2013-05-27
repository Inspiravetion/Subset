////////////
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