
var Response = function(){

    this.head = null;
    this.body = null;
    this.foot = null;
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