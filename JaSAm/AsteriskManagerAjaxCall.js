/**
 * Singleton-Class AbstractAsteriskManagerAjaxCall for ajax-calls
 * This is based on ExtJS from Sencha
 */
var AsteriskManagerAjaxCall = function(){
    var activeX = ['Msxml2.XMLHTTP.6.0',
    'Msxml2.XMLHTTP.3.0',
    'Msxml2.XMLHTTP'];

    /**
     * ...
     * PRIVATE FUNCTION
     * @param response <object> ...
     */
    var createConnection = function(){
        var http;
        try {
            http = new XMLHttpRequest();
        } catch(e) {
            for (var i = 0; i < activeX.length; ++i) {
                try {
                    http = new ActiveXObject(activeX[i]);
                    break;
                } catch(e) {}
            }
        } finally {
            return http;
        }
    };
    
    var serialize = function(obj) {
        var str = [];
        for(var p in obj)
            str.push(p + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    };
    
    return {
        
        /**
        * ...
        * PUBLIC FUNCTION
        * @param method <string> ...
        * @param uri <string> ...
        * @param params <object> ...
        * @param callbackFunction <function> ...
        * @param scope <object> ...
        */        
        request: function(method, uri, params, callbackFunction, scope){
            var data = serialize(params);
            var connection = createConnection();
            var postData = null;
            
            if(method == 'GET')
                uri += '?' + data;
            else if(method == 'POST')
                postData = data;
            
            connection.open(method, uri, true);
            connection.onreadystatechange = function() {
                if (connection.readyState==4) {
                    callbackFunction.apply(scope, [connection]);                    
                }
            }
            connection.send(postData);                 
        }
    };
}();