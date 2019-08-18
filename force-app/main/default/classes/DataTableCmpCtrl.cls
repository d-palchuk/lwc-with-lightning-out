public with sharing class DataTableCmpCtrl {

    @AuraEnabled(cacheable=true)
    public static List<Account> findAccounts(String accountName){
        String searchKey = '%' + accountName + '%';

        return [
            SELECT Name, Type, Website, Phone, AnnualRevenue, SLAExpirationDate__c
            FROM Account
            WHERE Name LIKE :searchKey
            LIMIT 100
        ];
    }
}
