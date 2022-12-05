import { LightningElement, wire, track, api } from 'lwc';
import { doRequest } from 'c/utils';

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

        doRequest(getProducts, {
            restaurantId : this.restaurantId,
        })
        .then(response => {
            this.products = response.length > 0 ? response : undefined;

        })
        .finally(() => {
            this.showSpinner = false;
        })
    }
    fetchRestaurants() {
        doRequest(getRestaurants)
        .then(response => {
            this.restaurants = response;
        })
        .finally(() => {
        })
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