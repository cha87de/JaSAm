var AjaxCall = require('../core/AjaxCall.js').AjaxCall;
var ResponseItem = require('../messages/ResponseItem.js').ResponseItem;
var Response = require('../messages/Response.js').Response;

/**
 * AbstractAsteriskManager
  */
var BasicManager = function(){
    
    this.baseUrl = '/asterisk/mxml';
    this.ajaxCall = new AjaxCall();
    var parser = null;
    var self = this;
    
    /**
     * setAjaxCall
     * PUBLIC FUNCTION
     * @param ajaxCall <Object> Set specific ajaxCall
     */
    this.setAjaxCall = function(ajaxCall){
        this.ajaxCall = ajaxCall;
    };
    
    /**
     * getAjaxCall
     * PUBLIC FUNCTION
     */
    this.getAjaxCall = function(){
        return this.ajaxCall;
    };
    
    /**
     * setParser
     * PUBLIC FUNCTION
     * @param _parser <Object> Set specific parser
     */
    this.setParser = function(_parser){
        parser = _parser;
    };
    
    /**
     * This Function sends an action with an parameter-object to the asterisk-server. 
     * PUBLIC FUNCTION
     * @param action <string> name of action to send
     * @param parameter <object> parameters for action
     * @param callback <function> callback function to execute whenn call is finished
     * @param scope <object> scope in which to execute callback function
     */
    var execute = function(url, action, parameter, callback, scope){
        var command = parameter ? parameter : {};
        command.action = action;
        
        // execute ajax-call with: method, baseUrl, command (Object?!)
        self.ajaxCall.request('GET', url, command, function(ajaxResponse){
            var xmlDoc = null;
            if(ajaxResponse.responseXML){
                xmlDoc = ajaxResponse.responseXML;
            }else{
                // Parse XMLDoc ...
                if(parser == null){
                    parser = new DOMParser();    
                }
                
                var str = ajaxResponse.responseText.replace(/\*/g, '');
                try{
                    xmlDoc=parser.parseFromString(str,"text/xml");
                }catch(exc){
                    console.info("Error parsing response from " + url + " command: ");
                    console.info(command);
                    console.info(exc);
                    console.info("str = " + str);
                }
            }
            var result = parseData(xmlToJson(xmlDoc));
            var response = parseResponse(result);
            response.xmlData = xmlDoc.toString();
            callback.apply(scope, [response]);
        }, this);
    };

    this.execute = function(action){
        var url = (action.differingBaseUrl != null ? action.differingBaseUrl : this.baseUrl);
        execute(url, action.name, action.params, action.setResponse, action);
    };

    /**
     * ...
     * PRIVATE FUNCTION
     * @param response <object> ...
     */
    var parseData = function(response){
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
        
        var timestamp = null;
        if(response['ajax-response']['@attributes'] !== undefined)
            timestamp = response['ajax-response']['@attributes'].name;
        result.push(timestamp);
        
        return result;
    };
    
    var parseResponse = function(data){
        var response = new Response();
        
        if(data.length > 0){
            // first part is head
            response.head = data[0];

            // middle parts are body
            for(var i = 1; i<data.length-2; i++){
                if(!response.body)
                    response.body = new Array();
                response.body.push(parseResponseItem(data[i]));
            }
            
            // last part is foot
            if(data.length > 2){
                response.foot = parseResponseItem(data[data.length-2]);
            }                

            // last part is foot
            if(data.length > 2){
                response.timestamp = data[data.length-1];
            }
        }
        return response;
    };
    
    var parseResponseItem = function(data){
        var name = data.event ? data.event : null;
        delete data.event;

        var responseItem = new ResponseItem();
        responseItem.name = name;
        responseItem.content = data; 
        
        return responseItem;
    }
    
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
                    var attribute = xml.attributes[j];
                    obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
                }
            }
        } else if (xml.nodeType == 3) { // text
            obj = xml.nodeValue;
        }

        // do children
        if (xml.hasChildNodes) {
            for(var i = 0; i < xml.childNodes.length; i++) {
                var item = xml.childNodes[i];
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

BasicManager.print = function(){
    if(BasicManager.debugMode){
        console.info(arguments);
    }
}

exports.BasicManager = BasicManager;
