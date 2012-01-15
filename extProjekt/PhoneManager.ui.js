/*
 * File: PhoneManager.ui.js
 * Date: Sun Jan 15 2012 20:57:13 GMT+0100 (CET)
 * 
 * This file was generated by Ext Designer version 1.1.2.
 * http://www.sencha.com/products/designer/
 *
 * This file will be auto-generated each and everytime you export.
 *
 * Do NOT hand edit this file.
 */

PhoneManagerUi = Ext.extend(Ext.Window, {
    title: 'PhoneManager',
    width: 846,
    height: 330,
    layout: 'border',
    closable: false,
    resizable: false,
    modal: true,
    draggable: false,
    initComponent: function() {
        this.tbar = {
            xtype: 'toolbar',
            items: [
                {
                    xtype: 'button',
                    text: 'Commander',
                    ref: '../buttonCommander'
                },
                {
                    xtype: 'button',
                    text: 'EventListener',
                    ref: '../buttonEventListener'
                },
                {
                    xtype: 'tbfill'
                },
                {
                    xtype: 'button',
                    text: 'Abmelden',
                    ref: '../buttonLogout'
                }
            ]
        };
        this.items = [
            {
                xtype: 'panel',
                region: 'north',
                border: false,
                height: 30,
                padding: 5,
                items: [
                    {
                        xtype: 'label',
                        text: 'Willkommen bei PhoneManager. Bitte wählen Sie einen Benutzer!',
                        itemId: 'statusLabel',
                        ref: '../statusLabel'
                    }
                ]
            },
            {
                xtype: 'panel',
                region: 'west',
                width: 300,
                border: false,
                padding: 5,
                items: [
                    {
                        ref: '../actionChooseUser',
                        xtype: 'ActionChooseUser'
                    },
                    {
                        ref: '../actionStartCall',
                        xtype: 'ActionStartCall'
                    }
                ]
            },
            {
                xtype: 'panel',
                flex: 1,
                region: 'center',
                width: 100,
                border: false,
                padding: 5,
                items: [
                    {
                        ref: '../actionIncomingCalls',
                        xtype: 'ActionCurrentCalls'
                    },
                    {
                        ref: '../actionListUsers',
                        xtype: 'ActionListUsers'
                    }
                ]
            }
        ];
        PhoneManagerUi.superclass.initComponent.call(this);
    }
});
