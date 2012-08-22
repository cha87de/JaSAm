var Task = require('../../../framework/tasks/Task.js').Task;
var mysql = require('mysql');

var CallDetailRecord = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    
    var agentId = 'SIP/' + args['extension'];
    var extension = args['extension'];
    var start = args['start'];
    var limit = args['limit'];
    var since = args['since'];
    var mysqlLogin = args['mysqlLogin'];
    
    this.run = function (){
        var client = mysql.createClient(mysqlLogin);
        client.query('USE asteriskcdrdb');
        
        /*
         * build sqlquery depending on given params
         */
        var query = 'SELECT SQL_CALC_FOUND_ROWS * FROM `cdr` ';
        query += ' WHERE `dst` != "s" ';
        if(since !== undefined)
            query += " AND UNIX_TIMESTAMP(`calldate`) >= " + since;
        if(extension !== undefined)
            query += ' AND ( ' +
                    ' `src` = "'+extension + '" OR' +
                    ' `dst` = "'+extension + '" OR' +
                    ' `channel` LIKE "'+agentId + '%" OR' +
                    ' `dstchannel` LIKE "'+agentId + '%"' + 
                ' ) ';
        query += ' ORDER BY `calldate` DESC';
        if(start !== undefined && limit !== undefined)
            query +=' LIMIT ' + start + ', ' + limit;
        
        client.query(
            query,
            function selectCb(err, results, fields) {
                var result = null;
                if (err) {
                    result = {
                        "success": false,
                        "errorInfo": err
                    };
                    callback.apply(scope, [JSON.stringify(result)]);
                } else {
                    client.query(
                        "SELECT FOUND_ROWS()",
                        function selectCb(err, total, fields) {
                            if (err) {
                                result = {
                                    "success": false,
                                    "errorInfo": err
                                };
                            } else {
                                result = {
                                    "success": true,
                                    "data": results,
                                    "total": total[0]['FOUND_ROWS()']
                                };
                            }
                            callback.apply(scope, [JSON.stringify(result)]);
                        }
                    );
                }
                client.end();
            }
        );
    };
    
};
CallDetailRecord.prototype = new Task();

exports.CallDetailRecord = CallDetailRecord;