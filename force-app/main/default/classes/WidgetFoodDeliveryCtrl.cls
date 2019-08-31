public with sharing class WidgetFoodDeliveryCtrl {

    private final static WithoutSharingOps wosInstance = new WithoutSharingOps();

    @AuraEnabled
    public static List<RestaurantWrapper> getRestaurants() {
        return wosInstance.getRestaurantWrappers();
    }

    @AuraEnabled
    public static List<Product__c> getProducts(String restaurantId) {
        return wosInstance.getProducts(restaurantId);
    }

    @AuraEnabled
    public static ResultData createOrder(String orderInfoJSON, String orderItemsJSON){
        ResultData       resultData       = new ResultData();
        OrderInfoWrapper orderInfoWrapper = (OrderInfoWrapper)JSON.deserialize(orderInfoJSON, OrderInfoWrapper.class);

        String   clientId = wosInstance.upsertClientRecord(orderInfoWrapper, resultData);
        Order__c order    = wosInstance.insertOrderRecord(clientId, orderInfoWrapper, resultData);

        wosInstance.insertOrderItems(order, orderItemsJSON, resultData);

        return resultData;
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
        @auraEnabled public String status = 'SUCCESS';
        @AuraEnabled public String message;
        @AuraEnabled public String orderNumber;
    }


    private without sharing class WithoutSharingOps {

        public List<RestaurantWrapper> getRestaurantWrappers() {
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

            query += String.isNotBlank(restaurantId) ? 'AND Restaurant__c = :restaurantId' : '';

            return (List<Product__c>) Database.query(query);

        }

        public String upsertClientRecord(OrderInfoWrapper orderInfoWrapper, ResultData resultData) {
            if (String.isBlank(orderInfoWrapper.clientName) || String.isBlank(orderInfoWrapper.clientPhone)) {
                resultData.status = 'REQUIRED_FIELDS_ARE_BLANK';
                return null;
            }

            Client__c clientRecord = new Client__c(
                Name     = orderInfoWrapper.clientName,
                Phone__c = orderInfoWrapper.clientPhone,
                Email__C = orderInfoWrapper.clientEmail
            );

            for (Client__c client : [SELECT Name, Phone__c, Email__c FROM Client__c WHERE Phone__c = :orderInfoWrapper.clientPhone]) {
                clientRecord.Id       = client.Id;
                clientRecord.Name     = String.isNotBlank(clientRecord.Name)     ? clientRecord.Name     : client.Name;
                clientRecord.Email__C = String.isNotBlank(clientRecord.Email__C) ? clientRecord.Email__C : client.Email__C;
                break;
            }

            upsert clientRecord;

            return clientRecord.Id;
        }


        public Order__c insertOrderRecord(String clientId, OrderInfoWrapper orderInfoWrapper, ResultData resultData) {
            if (resultData.status != 'SUCCESS') return null;

            Order__c orderRecord = new Order__c(
                Client__c           = clientId,
                DeliveryDateTime__c = orderInfoWrapper.deliveryDateTime
            );

            insert orderRecord;

            return [SELECT Name FROM Order__c WHERE Id =:orderRecord.Id LIMIT 1];
        }

        public void insertOrderItems(Order__c order, String orderItemsJSON, ResultData resultData) {
            List<OrderItemWrapper> orderItemWrappers = (List<OrderItemWrapper>)JSON.deserialize(orderItemsJSON, List<OrderItemWrapper>.class);
            List<OrderItem__c>     orderItemRecords  = new List<OrderItem__c>();

            for (OrderItemWrapper item : orderItemWrappers) {
                orderItemRecords.add(new OrderItem__c(
                    Product__c = item.productId,
                    Count__c   = item.count,
                    Order__c   = order.Id
                ));
            }

            insert orderItemRecords;

            resultData.orderNumber = order.Name;
        }

    }
}