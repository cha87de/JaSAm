
var ResponseItem = function(){

    this.name = null;
    this.content = null;

};

ResponseItem.prototype.toString = function(){
    return "[ResponseItem " + this.name + "]: " + this.content;
}

exports.ResponseItem = ResponseItem;
