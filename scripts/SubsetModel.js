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

SubsetModel.prototype.saveSubset = function(id, newValue) {
  // body...
  this.emit('save_subset', id);
};

SubsetModel.prototype.getSubsetGroup = function(fileName){
  return this.groups[fileName];
};