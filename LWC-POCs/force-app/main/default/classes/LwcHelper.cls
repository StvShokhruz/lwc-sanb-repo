public class LwcHelper {
    
    @AuraEnabled(cacheable=true)
    public static List<PricebookEntry> getAvailableAllStdPrcBookProducts(){

        return [SELECT Product2.Id, Product2.Name, UnitPrice, Product2.Family 
                FROM PricebookEntry
                WHERE isActive=true AND Pricebook2.IsStandard = true
                WITH SECURITY_ENFORCED];
    }

    @AuraEnabled(cacheable=true)
    public static List<OrderItem> getOrderItems(String orderId){

        return [SELECT Id, Product2.Name, Product2.Family, Quantity, UnitPrice, TotalPrice 
                FROM OrderItem
                WHERE OrderId =: orderId 
                WITH SECURITY_ENFORCED];
    }

   @AuraEnabled
   public static void saveOrderItems(){
       try {
           
       } catch (Exception e) {
           throw new AuraHandledException(e.getMessage());
       }
   }

   @AuraEnabled
   public static void deleteOrderItems(){
       try {
           
       } catch (Exception e) {
           throw new AuraHandledException(e.getMessage());
       }
   }
}