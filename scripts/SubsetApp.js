window.onload = function(){

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