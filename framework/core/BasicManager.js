var AjaxCall = require('./AjaxCall.js').AjaxCall;
var ResponseItem = require('../messages/ResponseItem.js').ResponseItem;
var Response = require('../messages/Response.js').Response;
var XmlToJson = require('../utils/XmlToJson.js').XmlToJson;

/**
 * AbstractAsteriskManager
  */
var BasicManager = function(){
    
    this.baseUrl = '/asterisk/mxml';
    var ajaxCall = new AjaxCall();
    var parser = null;
    var jsonParser = null;
    var xml2json = (new XmlToJson()).xml2json;

    /**
     * setAjaxCall
     * PUBLIC FUNCTION
     * @param ajaxCall <Object> Set specific ajaxCall
     */
    this.setAjaxCall = function(_ajaxCall){
        ajaxCall = _ajaxCall;
    };
    
    /**
     * getAjaxCall
     * PUBLIC FUNCTION
     */
    this.getAjaxCall = function(){
        return ajaxCall;
    };
    
    /**
     * setJsonParser
     * PUBLIC FUNCTION
     * @param _jsonParser <Object> Set specific parser
     */
    this.setJsonParser = function(_jsonParser){
        jsonParser = _jsonParser;
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
        ajaxCall.request('GET', url, command, function(ajaxResponse){
            var str, xmlData, jsonDoc;
            if(jsonParser === null){
                var xmlDoc = null;
                if(ajaxResponse.responseXML){
                    xmlDoc = ajaxResponse.responseXML;
                }else{
                    // Parse XMLDoc ...
                    if(parser == null){
                        parser = new DOMParser();    
                    }

                    str = ajaxResponse.responseText.replace(/\*/g, '');
                    try{
                        xmlDoc=parser.parseFromString(str,"text/xml");
                    }catch(exc){
                        console.info("Error parsing response from " + url + " command: ");
                        console.info(command);
                        console.info(exc);
                        console.info("str = " + str);
                        return;
                    }
                }
                jsonDoc = xml2json(xmlDoc);
                xmlData = xmlDoc.toString();
            }else{
                if(ajaxResponse.responseXML)
                    str = ajaxResponse.responseXML;
                else
                    str = ajaxResponse.responseText.replace(/\*/g, '');    
                jsonDoc = jsonParser.toJson(str);
                jsonDoc = JSON.parse(jsonDoc);
                xmlData = str;
            }
            var result = parseData(jsonDoc);
            var response = parseResponse(result);
            response.xmlData = xmlData;
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
                if(response['ajax-response']['response'][i]['generic']){
                    var tmp =  [];
                    for(var attribute in response['ajax-response']['response'][i]['generic']){
                        tmp[attribute] = response['ajax-response']['response'][i]['generic'][attribute];
                    }
                    result.push(tmp);
                }      
            }
        }else{
            if(response['ajax-response']['response']['generic'])
                var tmp =  [];
                for(var attribute in response['ajax-response']['response']['generic']){
                    tmp[attribute] = response['ajax-response']['response']['generic'][attribute];
                }
                result.push(tmp);
            }

        var timestamp = null;
        if(response['ajax-response'] !== undefined)
            timestamp = response['ajax-response'].name;
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
};

BasicManager.print = function(){
    if(BasicManager.debugMode){
        console.info(arguments);
    }
}

exports.BasicManager = BasicManager;
