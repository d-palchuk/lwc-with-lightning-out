import { LightningElement, wire, track }                            from 'lwc';
import { refreshApex }                                              from '@salesforce/apex';
import { deleteRecord }                                             from 'lightning/uiRecordApi';
import { CurrentPageReference }                                     from 'lightning/navigation';
import { showNotification, TOAST_TYPE, EVENT_NAME }                 from 'c/utils';
import { registerListener, unregisterAllListeners, fireEvent }      from 'c/pubsub';

import findAccounts from '@salesforce/apex/DataTableCmpCtrl.findAccounts';

const DELAY = 300;

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Edit',         name: 'edit' },
    { label: 'Delete',       name: 'delete' },
];

export default class DataTableCmp extends LightningElement {
    columns = [
        { label: 'Name',                fieldName: 'Name' },
        { label: 'Type'        ,        fieldName: 'Type' },
        { label: 'Phone',               fieldName: 'Phone',                type: 'phone'    },
        { label: 'Website',             fieldName: 'Website',              type: 'url'      },
        { label: 'Annual Revenue',      fieldName: 'AnnualRevenue',        type: 'currency' },
        { label: 'SLA Expiration Date', fieldName: 'SLAExpirationDate__c', type: 'date'     },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        },
    ];

    @track accountName = '';

    @wire(CurrentPageReference) pageRef;

    @wire(findAccounts, { accountName : '$accountName'})
    wiredAccounts;


    connectedCallback() {
        if (this.pageRef) registerListener(EVENT_NAME.FORM_CRUD, this.handlerRefreshTable, this);
    }
    disconnectedCallback() {
        if (this.pageRef) unregisterAllListeners(this);
    }


    handlerRefreshTable(message) {
       refreshApex(this.wiredAccounts);
       showNotification('Success', message || 'Table updated!', TOAST_TYPE.SUCCESS);
    }

    handlerSearchAccounts(event) {
        clearTimeout(this.delayTimeout);

        const searchKey = event.target.value;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.accountName = searchKey;
        }, DELAY);
    }

    handlerRowAction(event) {
        const row = event.detail.row;

        switch (event.detail.action.name) {
            case 'show_details':
                if (this.pageRef) fireEvent(this.pageRef, EVENT_NAME.ACCOUNT_SELECTED, { Id :  row.Id, mode : 'readOnly'} );
                break;
            case 'edit':
                if (this.pageRef) fireEvent(this.pageRef, EVENT_NAME.ACCOUNT_SELECTED, { Id :  row.Id, mode : 'edit'} );
                break;
            case 'delete':
                this.handlerDeleteRecord(row.Id);
                break;
            default:
        }
    }

    handlerDeleteRecord(recordId) {
        deleteRecord(recordId)
        .then(() => {
            if (this.pageRef) fireEvent(this.pageRef, EVENT_NAME.ACCOUNT_DELETED, recordId);

            this.handlerRefreshTable('Record has been deleted.');
        })
        .catch(error => showNotification('Error', error.message, TOAST_TYPE.ERROR))
    }
}