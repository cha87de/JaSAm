
/**
 * AbstractAsteriskManager
  */
var AbstractAsteriskManager = function(){
    
    var baseUrl = '/asterisk/mxml';

    /**
     * setBaseUrl
     * PUBLIC FUNCTION
     * @param url <String> Path to XML-AsteriskManager, default: /asterisk/mxml
     */
    this.setBaseUrl = function(url){
        baseUrl = url;
    };

    /**
     * This Function sends an action with an parameter-object to the asterisk-server. 
     * PUBLIC FUNCTION
     * @param action <string> name of action to send
     * @param parameter <object> parameters for action
     * @param callbackFunction <function> callback function to execute whenn call is finished
     * @param scope <object> scope in which to execute callback function
     */
    this.executeCommand = function(action, parameter, callbackFunction, scope){
        var command = parameter;
        command.action = action;
        // execute ajax-call with: method, baseUrl, command (Object?!)
        AsteriskManagerAjaxCall.request('GET', baseUrl, command, function(ajaxResponse){
            var xmlDoc = null;
            if(ajaxResponse.responseXML){
                xmlDoc = ajaxResponse.responseXML;
            }else{
                // Parse XMLDoc ...
                var parser=new DOMParser();
                var str = ajaxResponse.responseText.replace(/\*/g, '');
                xmlDoc=parser.parseFromString(str,"text/xml");
            }
            var result = parseResponse(xmlToJson(xmlDoc));
            callbackFunction.apply(scope, [result]);            
        }, this);      
    };

    /**
     * ...
     * PRIVATE FUNCTION
     * @param response <object> ...
     */
    var parseResponse = function(response){
        var result = [];
        if(!response['ajax-response'] || !response['ajax-response']['response']){
            return result;
        }
        if(response['ajax-response']['response'].length > 0){
            for(var i = 0; i < response['ajax-response']['response'].length; i++){
                if(response['ajax-response']['response'][i]['generic'] && response['ajax-response']['response'][i]['generic']['@attributes'])
                    result.push(response['ajax-response']['response'][i]['generic']['@attributes']);
            }
        }else{
            if(response['ajax-response']['response']['generic'] && response['ajax-response']['response']['generic']['@attributes'])
                result.push(response['ajax-response']['response']['generic']['@attributes']);
        }
        return result;
    };
    
    /**
     * ...
     * PRIVATE FUNCTION
     * @param xml <object> ...
     */    
    var xmlToJson = function(xml) {
        // Create the return object
        var obj = {};

        if(xml == null)
            return obj;

        if (xml.nodeType == 1) { // element
            // do attributes
            if (xml.attributes.length > 0) {
                obj["@attributes"] = {};
                for (var j = 0; j < xml.attributes.length; j++) {
                    var attribute = xml.attributes.item(j);
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes()) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes.item(i);
                var nodeName = item.nodeName;
                if (typeof(obj[nodeName]) == "undefined") {
                    obj[nodeName] = xmlToJson(item);
                } else {
                    if (typeof(obj[nodeName].length) == "undefined") {
                        var old = obj[nodeName];
                        obj[nodeName] = [];
                        obj[nodeName].push(old);
                    }
                    if(!(typeof(obj[nodeName]) == "string" && 
                        obj[nodeName].replace(/^\s\s*/, '').replace(/\s\s*$/, '') == ""))
                        obj[nodeName].push(xmlToJson(item));
                }
            }
        }
        return obj;
    };    
};

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

var AsteriskManagerActionCollection = function(asteriskManagerParam){
    var asteriskManager = asteriskManagerParam;
    
    var actionListCommands = 'listcommands';
    var actionCommand = 'command';
    var actionCommandParam = 'manager show command';
    
    var commands = [];
    
    var basicProperties = {
        command: [
            ['command', '', '']
        ],
        listcommands: [],
        login: [
            ['username', '', ''],
            ['secret', '', ''],
        ],
        logoff: []
    };
    var properties = basicProperties;
    
    this.getCommands = function(){
        return commands;
    };

    this.getCommandProperties = function(action, callbackFunction, scope){
        if(properties[action])
            callbackFunction.apply(scope, [properties[action]]);
        else{
            asteriskManager.executeCommand(actionCommand, {command:  actionCommandParam + ' ' + action}, function(result){
                var resultArray = [];
                for(var property in result[0]){
                    if(property == "action" || property == "description" || property == "privilege" || property == "privilege-2" || property == "response" || property == "synopsis" || property == "variables")
                        continue;
                    var description = result[0][property];
                    resultArray.push([property, '', description]);
                }
                properties[action] = resultArray;
                callbackFunction.apply(scope, [properties[action]]);
            }, this);
        }
    };
    
    this.queryCommandInfos = function(){
        asteriskManager.executeCommand(actionListCommands, {}, function(result){
            var resultArray = [];
            for(var command in result[0]){
                var value = result[0][command];
                resultArray.push([command, value]);
            }
            commands = resultArray;
        }, this);
    }; 
};