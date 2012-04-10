
var Response = function(){

    this.head = null; // ResponseItem
    this.body = null; // Array of ResponseItem
    this.foot = null; // ResponseItem
    this.timestamp = null;
    
    this.xmlData = null; // xml-code of unparsed asterisk response

    this.isSuccess = function(){
        if(this.head && this.head.response && (
                this.head.response == 'Success' || 
                this.head.response == 'SuccessXX'
                ))
            return true;
        else
            return false;
    }
};

exports.Response = Response;