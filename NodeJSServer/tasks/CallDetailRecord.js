var Task = require('../../JaSAm/tasks/Task.js').Task;
var mysql = require('mysql');

var CallDetailRecord = function(args, callbackParam, scopeParam, asteriskManagerParam){
    
    var callback = callbackParam;
    var scope = scopeParam;
    
    var agentId = 'SIP/' + args['extension'];
    var extension = args['extension'];
    var start = args['start'];
    var limit = args['limit'];
    
    this.run = function (){
        var client = mysql.createClient({
            user: 'nodejs',
            password: 'secret'
        });
        client.query('USE asteriskcdrdb');
        var whereStatement = 'WHERE `dst` != "s" ';
        if(extension !== undefined)
            whereStatement += ' AND ( ' +
                    ' `src` = "'+extension + '" OR' +
                    ' `dst` = "'+extension + '" OR' +
                    ' `channel` LIKE "'+agentId + '%" OR' +
                    ' `dstchannel` LIKE "'+agentId + '%"' + 
                ' ) ';
        client.query(
            'SELECT SQL_CALC_FOUND_ROWS * FROM `cdr` '+
            whereStatement + 
            ' ORDER BY `calldate` DESC' +
            ' LIMIT ' + start + ', ' + limit,
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