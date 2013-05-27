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