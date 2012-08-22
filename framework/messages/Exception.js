
var Exception = function(textParam){

    this.text = textParam;

    this.getMessage = function(){
        return this.text;
    };

};

exports.Exception = Exception;
