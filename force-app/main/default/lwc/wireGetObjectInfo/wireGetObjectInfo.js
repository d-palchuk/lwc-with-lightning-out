import { LightningElement, wire, track } from 'lwc';
import { getObjectInfo }                 from 'lightning/uiObjectInfoApi';

export default class WireGetObjectInfo extends LightningElement {
    objectApiName;

    @track showInformation = false;

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    objectInfo;

    get hasObjectData() {
        return this.objectInfo.data && this.showInformation;
    }

    updateObjectApiName() {
        this.showInformation = true;

        this.objectApiName = this.template.querySelector(
            'lightning-input'
        ).value;
    }
    hideObjectInfo() {
        this.showInformation = false;
    }

    get objectInfoStr() {
        return this.objectInfo
            ? JSON.stringify(this.objectInfo.data, null, 2)
            : '';
    }
}
