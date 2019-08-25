import { LightningElement, track, api } from 'lwc';
import getProducts                            from '@salesforce/apex/WidgetFoodDeliveryCtrl.createOrder';


export default class FormNewOrder extends LightningElement {

    @track orderItems  = [];

    @track showSpinner = false;
    @track orderAmount = 0;
    @track stage       = 1;
    @track clientId;

    @api
    addOrderItem(product) {
        const orderItem = {
            productId : product.Id,
            price     : product.Price__c,
            count     : 1,
        };
        const itemIndex = this.orderItems.findIndex(item => item.productId === orderItem.productId);

        if (~itemIndex) {
            this.orderItems[itemIndex].count += 1;
        } else {
            this.orderItems.push(orderItem);
        }

        this.increaseOrderAmount(orderItem.price);
    }


    get cardTitle() {
        return this.stage === 1 ? 'Order Items:' : 'Contact Information:';
    }
    get cardIcon() {
        return this.stage === 1 ? 'standard:orders' : 'standard:contact';
    }

    get isNextVisible() {
        return this.stage === 1 && this.orderAmount;
    }
    get isSecondStep() {
        return this.stage === 2;
    }


    handlerAddToOrder(event) {
        const itemIndex = event.target.dataset.itemIndex;

        this.orderItems[itemIndex].count += 1;

        this.increaseOrderAmount(this.orderItems[itemIndex].Price__c);
    }
    handlerRemoveFromOrder(event) {
        const itemIndex = event.target.dataset.itemIndex;

        this.orderItems[itemIndex].count -= 1;

        this.subtractOrderAmount(this.orderItems[itemIndex].price);

        if (this.orderItems[itemIndex].count === 0) this.orderItems.splice(itemIndex, 1);
    }
    handlerNextStep() {
        this.stage = 2;
    }
    handlerPreviousStep() {
        this.stage = 1;
    }
    handlerConfirmOrder() {

    }

    increaseOrderAmount(value) {
        this.orderAmount += value;
    }
    subtractOrderAmount(value) {
        this.orderAmount -= value;
    }
}