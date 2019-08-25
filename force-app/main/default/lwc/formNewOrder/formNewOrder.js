import { LightningElement, track, api } from 'lwc';
import { makeServerCall }               from 'c/utils';
import createOrder                      from '@salesforce/apex/WidgetFoodDeliveryCtrl.createOrder';


export default class FormNewOrder extends LightningElement {

    @track orderItems  = [];

    @track showSpinner = false;
    @track orderAmount = 0;
    @track stage       = 1;
    @track clientId;

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
        // this.showSpinner = true;

        let orderInfo = Array.from(this.template.querySelectorAll('lightning-input')).reduce((info, input) => {
            info[input.name] = input.value;
            return info;
        }, {})

        console.log(JSON.stringify(orderInfo))

        const params = {
            orderInfoJSON  : JSON.stringify(orderInfo),
            orderItemsJSON : JSON.stringify(this.orderItems),
        };
        makeServerCall(createOrder, params, result => {
            console.log(JSON.stringify(result));
            this.showSpinner = false;
        });

    }
    test(event) {
        console.log(event.target.value)
    }

    increaseOrderAmount(value) {
        this.orderAmount += value;
    }
    subtractOrderAmount(value) {
        this.orderAmount -= value;
    }
}