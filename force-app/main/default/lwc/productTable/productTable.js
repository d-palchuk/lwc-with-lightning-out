import { LightningElement, wire, track, api } from 'lwc';
import { makeServerCall }                     from 'c/utils';

import userId              from '@salesforce/user/Id';
import getRestaurants      from '@salesforce/apex/WidgetFoodDeliveryCtrl.getRestaurants';
import getProducts         from '@salesforce/apex/WidgetFoodDeliveryCtrl.getProducts';


export default class ProductTable extends LightningElement {

    @api restaurantId;

    @track products;
    @track restaurants;
    @track isSystemAdmin;
    @track showSpinner
    @track showAddProductForm;

    get isAdmin() {
        return  this.restaurantId && userId;
    }


    connectedCallback() {
        this.isSystemAdmin = !this.restaurantId && userId;

        if (this.isSystemAdmin) this.fetchRestaurants();
        if (this.restaurantId)  this.fetchProducts();
    }

    @api
    fetchProducts() {
        this.showSpinner = true;

        let params = {
            restaurantId : this.restaurantId,
        };

        makeServerCall(getProducts, params, response => {
            this.products = response.length > 0 ? response : undefined;

            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this.showSpinner = false; }, 4);
        });
    }
    fetchRestaurants() {
        makeServerCall(getRestaurants, null, response => {
            this.restaurants = response;
        });
    }

    handlerChangeRestaurant(event) {
        event.target.blur();

        this.dispatchEvent(new CustomEvent('changerestaurant', {
            detail : {
                restaurantId : event.detail.value,
            }
        }));
    }
    handlerAddItemToOrder(event) {
        event.target.blur();

        this.dispatchEvent(new CustomEvent('additem', {
            detail : {
                product : this.products.find(product => product.Id === event.target.dataset.productId),
            }
        }));
    }
    handlerShowAddProductForm(event) {
        this.dispatchEvent(new CustomEvent('addproduct'));
    }
    handlerEditProduct(event) {
        event.stopPropagation();

        this.dispatchEvent(new CustomEvent('editproduct', {
            detail : {
                productId : event.target.dataset.productId
            }
        }));
    }
}