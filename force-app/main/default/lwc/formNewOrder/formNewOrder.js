/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, track, api } from 'lwc';
import { makeServerCall, showNotification }               from 'c/utils';
import createOrder                      from '@salesforce/apex/WidgetFoodDeliveryCtrl.createOrder';


export default class FormNewOrder extends LightningElement {

    @track orderItems  = [];

    @track spinnerShowed = false;
    @track orderAmount   = 0;
    @track stage         = 1;

    @api
    addOrderItem(product) {
        const orderItem = {
            productName : product.Name,
            productId   : product.Id,
            price       : product.Price__c,
            count       : 1,
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

    get isFirstStage() {
        return this.stage === 1 && this.orderAmount;
    }
    get isSecondStage() {
        return this.stage === 2;
    }
    get isThirdStage() {
        return this.stage === 3;
    }


    handlerSetFirstStage() {
        this.stage = 1;
    }
    handlerSetNextStage() {
        this.stage += 1;
    }
    handlerAddToOrder(event) {
        const itemIndex = event.target.dataset.itemIndex;

        this.orderItems[itemIndex].count += 1;

        this.increaseOrderAmount(this.orderItems[itemIndex].price);
    }
    handlerRemoveFromOrder(event) {
        const itemIndex = event.target.dataset.itemIndex;

        this.orderItems[itemIndex].count -= 1;

        this.subtractOrderAmount(this.orderItems[itemIndex].price);

        if (this.orderItems[itemIndex].count === 0) this.orderItems.splice(itemIndex, 1);
    }
    handlerConfirmOrder() {
        this.showSpinner();

        const orderInfoFields = Array.from(this.template.querySelectorAll('.order-info lightning-input'));
        const orderInfo       = orderInfoFields.reduce((info, field) => {
            field.showHelpMessageIfInvalid();
            info[field.name] = field.value;
            return info;
        }, {});

        if (orderInfoFields.every(field => field.checkValidity()) === false) return this.hideSpinner();

        const params = {
            orderInfoJSON  : JSON.stringify(orderInfo),
            orderItemsJSON : JSON.stringify(this.orderItems),
        };

        makeServerCall(createOrder, params, result => {
            showNotification('Order has been created', `Your order number: ${result.orderNumber}`, 'SUCCESS');
            setTimeout(() => {
                this.clearOrderInfo();
                this.hideSpinner();
            }, 4);
        });



    }

    clearOrderInfo() {
        this.orderItems  = [];
        this.orderAmount = 0
        this.stage       = 1;
    }
    increaseOrderAmount(value) {
        this.orderAmount += value;
    }
    subtractOrderAmount(value) {
        this.orderAmount -= value;
    }
    showSpinner() {
        this.spinnerShowed = true;
    }
    hideSpinner() {
        this.spinnerShowed = false;
    }
}