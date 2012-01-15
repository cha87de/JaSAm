/*
 * File: ActionListUsers.ui.js
 * Date: Sun Jan 15 2012 20:57:13 GMT+0100 (CET)
 * 
 * This file was generated by Ext Designer version 1.1.2.
 * http://www.sencha.com/products/designer/
 *
 * This file will be auto-generated each and everytime you export.
 *
 * Do NOT hand edit this file.
 */

ActionListUsersUi = Ext.extend(Ext.form.FieldSet, {
    title: 'Aktive Benutzer',
    initComponent: function() {
        this.items = [
            {
                xtype: 'grid',
                store: 'UserState',
                height: 138,
                border: false,
                ref: 'results',
                columns: [
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'extension',
                        header: 'Nr.',
                        sortable: true,
                        width: 50
                    },
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'name',
                        header: 'Benutzer',
                        sortable: true
                    },
                    {
                        xtype: 'gridcolumn',
                        dataIndex: 'status',
                        header: 'Status',
                        sortable: true,
                        width: 100
                    }
                ],
                tbar: {
                    xtype: 'toolbar',
                    items: [
                        {
                            xtype: 'button',
                            text: 'aktualisieren',
                            ref: '../../buttonReload'
                        }
                    ]
                }
            }
        ];
        ActionListUsersUi.superclass.initComponent.call(this);
    }
});
