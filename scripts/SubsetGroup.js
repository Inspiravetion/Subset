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