
var Response = function(){

    this.head = null;
    this.body = null;
    this.foot = null;

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