
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
