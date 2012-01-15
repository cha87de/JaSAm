/*
 * File: EventListener.ui.js
 * Date: Sun Jan 15 2012 20:57:13 GMT+0100 (CET)
 * 
 * This file was generated by Ext Designer version 1.1.2.
 * http://www.sencha.com/products/designer/
 *
 * This file will be auto-generated each and everytime you export.
 *
 * Do NOT hand edit this file.
 */

EventListenerUi = Ext.extend(Ext.Window, {
    title: 'EventListener',
    width: 569,
    height: 617,
    layout: 'fit',
    draggable: false,
    modal: true,
    initComponent: function() {
        this.items = [
            {
                xtype: 'tabpanel',
                border: false,
                tplWriteMode: 'append',
                activeTab: 0,
                ref: 'resultArea'
            }
        ];
        this.tbar = {
            xtype: 'toolbar',
            items: [
                {
                    xtype: 'button',
                    text: 'Start/Stop',
                    enableToggle: true,
                    ref: '../buttonToogleListener'
                }
            ]
        };
        EventListenerUi.superclass.initComponent.call(this);
    }
});
