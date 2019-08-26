import { LightningElement, wire, track, api } from 'lwc';
import { makeServerCall }                     from 'c/utils';
import isGuest                                from '@salesforce/user/isGuest';
import userId                                 from '@salesforce/user/Id';

import getRestaurants                         from '@salesforce/apex/WidgetFoodDeliveryCtrl.getRestaurants';
import getProducts                            from '@salesforce/apex/WidgetFoodDeliveryCtrl.getProducts';


export default class ProductTable extends LightningElement {

    @api restaurantId;

    @track selectedRestaurant;
    @track showRestaurants;
    @track showSpinner
    @track restaurants;
    @track products;

    get restaurantId() {
        return this.selectedRestaurant;
    }
    set restaurantId(value) {
        this.selectedRestaurant = value;
    }

    connectedCallback() {
        this.showRestaurants = this.restaurantId && !userId ? false : true;

        if (this.showRestaurants) this.fetchRestaurants();
        if (this.restaurantId)    this.fetchProducts();
    }


    fetchRestaurants() {
        makeServerCall(getRestaurants, null, response => {
            this.restaurants = response;
        });
    }
    fetchProducts() {
        this.showSpinner = true;

        let params = {
            restaurantId : this.selectedRestaurant,
        };

        makeServerCall(getProducts, params, response => {
            this.products = response.length > 0 ? response : undefined;

            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this.showSpinner = false; }, 4);
        });
    }


    handlerChangeRestaurant(event) {
        event.target.blur();
        this.selectedRestaurant = event.detail.value;
        this.fetchProducts();
    }
    handlerAddItemToOrder(event) {
        event.target.blur();

        this.dispatchEvent(new CustomEvent('additem', {
            detail : {
                product : this.products.find(product => product.Id === event.target.dataset.productId),
            }
        }));
    }
}