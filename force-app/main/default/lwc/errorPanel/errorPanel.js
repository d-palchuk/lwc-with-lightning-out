import { LightningElement, track, api }                      from 'lwc';
import { reduceErrors, showNotification, TOAST_TYPE } from 'c/utils';

export default class ErrorPanel extends LightningElement {

    @api friendlyMessage = 'Error retrieving data';

    @track viewDetails = false;

    connectedCallback() {
        showNotification('Error', this.friendlyMessage, TOAST_TYPE.ERROR);
    }

    /** Single or array of LDS errors */
    @api errors;

    get errorMessages() {
        return reduceErrors(this.errors);
    }

    handleCheckboxChange(event) {
        this.viewDetails = event.target.checked;
    }
}