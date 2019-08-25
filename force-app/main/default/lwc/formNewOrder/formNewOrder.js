import { LightningElement, track, api } from 'lwc';

export default class FormNewOrder extends LightningElement {

    @track orderItems  = [];
    @track orderAmount = 0;
    @track stage       = 1;

    @api
    addOrderItem(product) {
        const itemIndex = this.orderItems.findIndex(item => item.Id === product.Id);

        if (~itemIndex) {
            this.orderItems[itemIndex].count += 1;
        } else {
            product.count = 1;
            this.orderItems.push(product);
        }

        this.increaseOrderAmount(product.Price__c);
    }

    handlerAddToOrder(event) {
        const itemIndex = event.target.dataset.itemIndex;

        this.orderItems[itemIndex].count += 1;

        this.increaseOrderAmount(this.orderItems[itemIndex].Price__c);
    }
    handlerRemoveFromOrder(event) {
        const itemIndex = event.target.dataset.itemIndex;

        this.orderItems[itemIndex].count -= 1;

        this.subtractOrderAmount(this.orderItems[itemIndex].Price__c);

        if (this.orderItems[itemIndex].count === 0) this.orderItems.splice(itemIndex, 1);
    }

    increaseOrderAmount(value) {
        this.orderAmount += value;
    }
    subtractOrderAmount(value) {
        this.orderAmount -= value;
    }
}