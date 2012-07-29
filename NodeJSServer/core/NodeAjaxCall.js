/**
 * 
 */
 var AjaxCall = require("../../JaSAm/core/AjaxCall").AjaxCall;
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var NodeAjaxCall = function(){
    this.sessionId = null;

    /**
     *
     */
    this.createConnection = function(){
        return new XMLHttpRequest();
    };
    
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
                var response = {
                    responseText: connection.responseText,
                    responseXML: connection.responseXML
                };
                callback.apply(scope, [response]);                    
                self.onResponse(connection.getAllResponseHeaders());
            }
        }
        connection.send(postData);     
    };
    
    this.onResponse = function(headers){
        //save sessionId for first ajaxCall
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