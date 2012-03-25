/**
 * 
 */
 var AjaxCall = require("./AjaxCall").AjaxCall;

var NodeAjaxCall = function(){
    this.sessionId = null;
    
    /**
    * 
    * @param method <string> ...
    * @param uri <string> ...
    * @param params <object> ...
    * @param callback <function> ...
    * @param scope <object> ...
    * @return <void>
    */        
    this.request = function(method, uri, params, callback, scope){
        var data = this.serialize(params);
        var connection = this.createConnection();
        var postData = null;
        var self = this;

        if(method == 'GET')
            uri += '?' + data;
        else if(method == 'POST')
            postData = data;

        connection.open(method, uri, true);
        if(this.sessionId != null)
            connection.setRequestHeader('cookie', 'mansession_id="'+this.sessionId+'"; Version=1; Max-Age=50');
        connection.onreadystatechange = function() {
            if (connection.readyState==4) {
                callback.apply(scope, [connection]);                    
                self.onResponse(connection.getAllResponseHeaders());
            }
        }
        connection.send(postData);                 
    };
    
    this.onResponse = function(headers){
        //save sessionId after first ajaxCall
        if(this.sessionId == null){
            var tmp = headers.split("\n");
            for(var index in tmp){
                if(tmp[index].indexOf("set-cookie") == 0){
                    this.sessionId = tmp[index].split("\"")[1];
                    break;
                }
            }
        }
    }
};
NodeAjaxCall.prototype = new AjaxCall();

exports.NodeAjaxCall = NodeAjaxCall;