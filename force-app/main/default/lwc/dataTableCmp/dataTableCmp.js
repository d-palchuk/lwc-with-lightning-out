import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import findAccounts from '@salesforce/apex/DataTableCmpCtrl.findAccounts';

import { makeServerCall, showNotification, TOAST_TYPE } from 'c/utils';

/** The delay used when debouncing event handlers before invoking Apex. */
const DELAY = 300;

const actions = [
    { label: 'Show details', name: 'show_details' },
    { label: 'Edit',         name: 'edit' },
];


export default class DataTableCmp extends LightningElement {
    columns = [
        { label: 'Account Name',        fieldName: 'Name' },
        { label: 'Type'        ,        fieldName: 'Type' },
        { label: 'Website',             fieldName: 'Website',              type: 'url' },
        { label: 'Phone',               fieldName: 'Phone',                type: 'phone' },
        { label: 'Annual Revenue',      fieldName: 'AnnualRevenue',        type: 'currency' },
        { label: 'SLA Expiration Date', fieldName: 'SLAExpirationDate__c', type: 'date' },
        {
            type: 'action',
            typeAttributes: { rowActions: actions },
        },
    ];

    @track accountName = '';


    @wire(findAccounts, { accountName : '$accountName'})
    wiredAccounts;

    editAccountRecord(e) {
        let params = {

        };

        makeServerCall(updateAccountRecord, params, () => refreshApex(this.wiredAccounts));
    }

    handleNameChange(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.
        clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.accountName = searchKey;
        }, DELAY);
    }

    handleRowAction(event) {
        const row = event.detail.row;
        switch (event.detail.action.name) {
            case 'edit':
                showNotification('Success', 'Record has been updated.', TOAST_TYPE.SUCCESS);
                break;
            case 'show_details':
                showNotification('Show', 'Nothing to show!', TOAST_TYPE.WARNING);
                // this.showRowDetails(row);
                break;
            default:
        }
    }

    findRowIndexById(id) {
        let ret = -1;
        this.data.some((row, index) => {
            if (row.id === id) {
                ret = index;
                return true;
            }
            return false;
        });
        return ret;
    }

    showRowDetails(row) {
        this.record = row;
    }
}
