import { LightningElement, track, api } from 'lwc';

export default class WidgetFoodDelivery extends LightningElement {

    @api   restaurantId;
    @track productId;
    @track showAddProductForm;

    handlerAddItemToOrder(event) {
        this.template.querySelector('c-form-new-order').addOrderItem(event.detail.product);
    }
    handlerShowAddProductForm(event) {
        this.productId          = undefined;
        this.showAddProductForm = true;
    }
    handlerShowEditProductForm(event) {
        this.productId          = event.detail.productId;
        this.showAddProductForm = true;
    }
    handlerHideProductForm(event) {
        this.productId          = undefined;
        this.showAddProductForm = false;
    }
    handlerChangeRestaurant(event) {
        this.restaurantId = event.detail.restaurantId;

        this.updateProductsTable(event);
    }

    updateProductsTable(event) {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(() => this.template.querySelector('c-product-table').fetchProducts());
    }
}