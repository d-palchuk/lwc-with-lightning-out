import { LightningElement, wire, track, api } from 'lwc';
import { makeServerCall }                     from 'c/utils';

import userId              from '@salesforce/user/Id';
import RESTAURANT_ID_FIELD from '@salesforce/schema/Product__c.Restaurant__c';
import ACTIVE_FIELD        from '@salesforce/schema/Product__c.Active__c';
import NAME_FIELD          from '@salesforce/schema/Product__c.Name';
import PRICE_FIELD         from '@salesforce/schema/Product__c.Price__c';
import IMAGE_URL__FIELD    from '@salesforce/schema/Product__c.ImageUrl__c';
import DESCRIPTION__FIELD  from '@salesforce/schema/Product__c.Description__c';
import getRestaurants      from '@salesforce/apex/WidgetFoodDeliveryCtrl.getRestaurants';
import getProducts         from '@salesforce/apex/WidgetFoodDeliveryCtrl.getProducts';


export default class ProductTable extends LightningElement {

    product = {
        isActive    : ACTIVE_FIELD,
        name        : NAME_FIELD,
        price       : PRICE_FIELD,
        imageUrl    : IMAGE_URL__FIELD,
        description : DESCRIPTION__FIELD,
    }

    @api restaurantId;
    @api recordId;
    @api objectApiName = 'Product__c';

    @track products;
    @track restaurants;
    @track selectedRestaurantId;
    @track isSystemAdmin;
    @track showSpinner
    @track showAddProductForm;

    get restaurantId() {
        return this.selectedRestaurantId;
    }
    set restaurantId(value) {
        this.selectedRestaurantId = value;
    }
    get isAdmin() {
        return  this.restaurantId && userId;
    }


    connectedCallback() {
        this.isSystemAdmin = !this.restaurantId && userId;

        if (this.isSystemAdmin) this.fetchRestaurants();
        if (this.restaurantId)  this.fetchProducts();
    }


    fetchRestaurants() {
        makeServerCall(getRestaurants, null, response => {
            this.restaurants = response;
        });
    }
    fetchProducts() {
        this.showSpinner = true;

        let params = {
            restaurantId : this.selectedRestaurantId,
        };

        makeServerCall(getProducts, params, response => {
            this.products = response.length > 0 ? response : undefined;

            // eslint-disable-next-line @lwc/lwc/no-async-operation
            setTimeout(() => { this.showSpinner = false; }, 4);
        });
    }


    handlerChangeRestaurant(event) {
        event.target.blur();
        this.selectedRestaurantId = event.detail.value;
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