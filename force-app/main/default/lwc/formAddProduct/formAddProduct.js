import { LightningElement, track, api } from 'lwc';
import { showNotification, TOAST_TYPE } from 'c/utils';

import RESTAURANT_ID_FIELD from '@salesforce/schema/Product__c.Restaurant__c';
import ACTIVE_FIELD        from '@salesforce/schema/Product__c.Active__c';
import NAME_FIELD          from '@salesforce/schema/Product__c.Name';
import PRICE_FIELD         from '@salesforce/schema/Product__c.Price__c';
import IMAGE_URL__FIELD    from '@salesforce/schema/Product__c.ImageUrl__c';
import DESCRIPTION__FIELD  from '@salesforce/schema/Product__c.Description__c';

export default class FormAddProduct extends LightningElement {

    product = {
        isActive     : ACTIVE_FIELD,
        name         : NAME_FIELD,
        price        : PRICE_FIELD,
        imageUrl     : IMAGE_URL__FIELD,
        description  : DESCRIPTION__FIELD,
    }


    @api restaurantId;
    @api recordId;
    @api objectApiName = 'Product__c';

    get title() {
        return this.recordId ? 'Edit Product' : 'New Product';
    }

    handlerSubmit(event) {
        event.preventDefault();

        const fields = event.detail.fields;

        fields[RESTAURANT_ID_FIELD.fieldApiName] = this.restaurantId;

        this.template.querySelector('lightning-record-edit-form').submit(fields);
    }

    handlerSuccess(event) {
        showNotification('Product has been saved', '', TOAST_TYPE.SUCCESS);

        this.dispatchEvent(new CustomEvent('productcreated'));
    }
    handlerCloseForm(event) {
        this.dispatchEvent(new CustomEvent('closeform'));
    }
}