public with sharing class WidgetFoodDeliveryCtrl {

    private final static WithoutSharingOps wosInstance = new WithoutSharingOps();

    @AuraEnabled
    public static List<RestaurantWrapper> getRestaurants() {
        return wosInstance.getRestaurants();
    }
    @AuraEnabled
    public static List<Product__c> getProducts(String restaurantId) {
        return wosInstance.getProducts(restaurantId);
    }


    public class RestaurantWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String value;

        public RestaurantWrapper(Account acc) {
            this.value = acc.Id;
            this.label = acc.Name;
        }
        public RestaurantWrapper(String Id, String Name) {
            this.value = Id;
            this.label = Name;
        }

    }


    private without sharing class WithoutSharingOps {

        public List<RestaurantWrapper> getRestaurants() {
            List<RestaurantWrapper> restaurants = new List<RestaurantWrapper>{
                new RestaurantWrapper('', 'All')
            };

            for (Account acc : [SELECT Name FROM Account]) {
                restaurants.add(new RestaurantWrapper(acc));
            }

            return restaurants;
        }

        public List<Product__c> getProducts(String restaurantId) {
            String query = 'SELECT Name, Active__c, Description__c, ImageUrl__c, Price__c, Restaurant__c ' +
                           'FROM Product__c ' +
                           'WHERE Active__c = true ';
            System.debug('ZHOPA: ' + restaurantId + ' - ' + String.isNotBlank(restaurantId));
            query += String.isNotBlank(restaurantId) ? 'AND Restaurant__c = :restaurantId' : '';
            System.debug(query);
            return (List<Product__c>) Database.query(query);

        }

    }
}