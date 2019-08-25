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
    @AuraEnabled
    public static ResultData createOrder(String orderInfoJSON, String orderItemsJSON){
        OrderInfoWrapper orderInfoWrapper = (OrderInfoWrapper)JSON.deserialize(orderInfoJSON, OrderInfoWrapper.class);
        ResultData       resultData    = new ResultData();

        System.debug(orderInfoWrapper);

        Client__c        clientRecord  = new Client__c(
            Name     = orderInfoWrapper.clientName,
            Phone__c = orderInfoWrapper.clientPhone,
            Email__C = orderInfoWrapper.clientEmail
        );

        if (String.isNotBlank(orderInfoWrapper.clientId)) { clientRecord.Id = orderInfoWrapper.clientId; }

        System.debug(clientRecord);

        upsert clientRecord;

        System.debug(clientRecord);

        // if (orderInfoWrapper.clientId != null && orderInfoWrapper.clientId != clientRecord.Id) { resultData.clientId = clientRecord.Id; }

        Order__c orderRecord = new Order__c(
            Client__c           = clientRecord.Id,
            DeliveryDateTime__c = orderInfoWrapper.deliveryDateTime
        );

        insert orderRecord;

        resultData.orderNumber = [SELECT Name FROM Order__c WHERE Id =:orderRecord.Id LIMIT 1].Name;

        createOrderItemsFuture(orderRecord.Id, orderItemsJSON);

        return resultData;
    }

    
    private static void createOrderItemsFuture(String orderId, String orderItemsJSON) {
        List<OrderItemWrapper> orderItemWrappers = (List<OrderItemWrapper>)JSON.deserialize(orderItemsJSON, List<OrderItemWrapper>.class);
        List<OrderItem__c>     orderItemRecords  = new List<OrderItem__c>();

        for (OrderItemWrapper item : orderItemWrappers) {
            orderItemRecords.add(new OrderItem__c(
                Product__c = item.productId,
                Count__c   = item.count,
                Order__c   = orderId
            ));
        }

        insert orderItemRecords;
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

    public class OrderInfoWrapper {
        public String   clientId;
        public String   clientName;
        public String   clientPhone;
        public String   clientEmail;
        public DateTime deliveryDateTime;
    }

    public class OrderItemWrapper {
        public String  productName;
        public String  productId;
        public Integer count;
        public Decimal price;
    }

    public class ResultData {
        public String message = 'SUCCESS';
        public String clientId;
        public String orderNumber;
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