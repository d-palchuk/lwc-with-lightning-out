import { LightningElement, wire, track, api }                        from 'lwc';
import { showNotification, TOAST_TYPE, EVENT_NAME, }           from 'c/utils';
import { registerListener, unregisterAllListeners, fireEvent } from 'c/pubsub';
import { CurrentPageReference }                                from 'lightning/navigation';


import NAME_FIELD           from '@salesforce/schema/Account.Name';
import TYPE_FIELD           from '@salesforce/schema/Account.Type';
import PHONE_FIELD          from '@salesforce/schema/Account.Phone';
import WEBSITE_FIELD        from '@salesforce/schema/Account.Website';
import ANNUAL_REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import SLA_EXP_DATE_FIELD   from '@salesforce/schema/Account.SLAExpirationDate__c';


const MODE = {
    CREATE : false,
    READ_ONLY   : false,
    EDIT   : false,
    BOTH   : false,
}

export default class FormCreateReadEditAccount extends LightningElement {

    field = {
        Name              : NAME_FIELD,
        Type              : TYPE_FIELD,
        Phone             : PHONE_FIELD,
        Website           : WEBSITE_FIELD,
        AnnualRevenue     : ANNUAL_REVENUE_FIELD,
        SLAExpirationDate : SLA_EXP_DATE_FIELD,
    }

    @track MODE = {
        READ_ONLY : false,
        EDIT      : false,
    };

    @api recordId;
    @api objectApiName = 'Account';

    @wire(CurrentPageReference) pageRef;

    get isReadOnlyMode() {
        return this.MODE.READ_ONLY && this.recordId;
    }
    get isEditMode() {
        return this.MODE.EDIT;
    }
    get hasContent() {
        return this.recordId && this.MODE.READ_ONLY || this.MODE.EDIT;
    }
    get fields() {
        return Object.values(this.field);
    }


    connectedCallback() {
        if (this.pageRef) {
            registerListener(EVENT_NAME.ACCOUNT_SELECTED, this.handlerAccountSelected, this);
            registerListener(EVENT_NAME.ACCOUNT_DELETED, this.handlerRecordDeleted, this);
        }
    }
    disconnectedCallback() {
        if (this.pageRef) unregisterAllListeners(this);
    }


    handlerAccountSelected(details) {
        this.recordId = details.Id;

        switch(details.mode) {
            case 'readOnly' :
                this.MODE = {...MODE, ...{ READ_ONLY : true }};
                break;
            case 'edit' :
                this.MODE = {...MODE, ...{ EDIT : true }};
                break;
            default :
        }
    }
    handlerGenerateNewForm() {
        showNotification('Success', 'New form has been created.', TOAST_TYPE.SUCCESS);
        this.recordId = undefined;
        this.handlerSwitchToEditMode();
    }
    handlerSuccess(event) {
        if (this.pageRef) fireEvent(this.pageRef, EVENT_NAME.FORM_CRUD, undefined);
        if (!this.recordId) this.recordId = event.detail.id;

        setTimeout(() => this.handlerSwitchToReadMode(), 4);
    }
    handlerCancel() {
        showNotification('Canceled', '', TOAST_TYPE.INFO);
        this.handlerSwitchToReadMode();
    }
    handlerSubmit() {
        showNotification('Submitted', 'Form has been submitted.', TOAST_TYPE.INFO);
    }
    handlerRecordDeleted(recordId) {
        if (recordId === this.recordId) {
            this.recordId = undefined;
            this.MODE     = {...MODE};
        }
    }
    handlerSwitchToReadMode() {
        this.MODE     = {...MODE, ...{ READ_ONLY : true }};
    }
    handlerSwitchToEditMode() {
        this.MODE     = {...MODE, ...{ EDIT : true }};
    }

}