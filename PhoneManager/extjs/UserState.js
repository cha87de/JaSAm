/*
 * File: UserState.js
 * Date: Sat Feb 04 2012 17:54:13 GMT+0100 (CET)
 * 
 * This file was generated by Ext Designer version 1.1.2.
 * http://www.sencha.com/products/designer/
 *
 * This file will be auto-generated each and everytime you export.
 *
 * Do NOT hand edit this file.
 */

UserState = Ext.extend(Ext.data.ArrayStore, {
    constructor: function(cfg) {
        cfg = cfg || {};
        UserState.superclass.constructor.call(this, Ext.apply({
            storeId: 'UserState',
            fields: [
                {
                    name: 'extension'
                },
                {
                    name: 'name'
                },
                {
                    name: 'status'
                }
            ]
        }, cfg));
    }
});
new UserState();