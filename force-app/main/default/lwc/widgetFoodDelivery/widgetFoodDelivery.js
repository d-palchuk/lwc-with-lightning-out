import { LightningElement, api } from 'lwc';

export default class WidgetFoodDelivery extends LightningElement {

    @api restaurantId;

    handlerAddItemToOrder(event) {
        this.template.querySelector('c-form-new-order').addOrderItem(event.detail.product);
    }
}