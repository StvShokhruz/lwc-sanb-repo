import { LightningElement, track, wire, api } from 'lwc';
import { MessageContext, subscribe, unsubscribe, APPLICATION_SCOPE } from 'lightning/messageService';
import SELECTED_PRODUCTS from '@salesforce/messageChannel/Selected_Products__c';

import getOrderItems from '@salesforce/apex/LwcHelper.getOrderItems';
import saveOrderItems from '@salesforce/apex/LwcHelper.saveOrderItems';
import deleteOrderItems from '@salesforce/apex/LwcHelper.deleteOrderItems';
import { refreshApex } from '@salesforce/apex';

const columns = [{label: 'Name', fieldName: 'productName', type: 'text'},
                 {label: 'Unit Price', fieldName: 'unitPrice', type: 'number'},
                 {label: 'Quantity', fieldName: 'quantity', type: 'number', typeAttributes: { step: 1 }},
                 {label: 'Total Price', fieldName: 'totalPrice', type: 'currency'}];
//cellAttributes: { alignment: 'left' }}
export default class ManageOrderItems extends LightningElement {

    @api recordId;

    columnInfos = columns;
    wiredOrderProducts;
    subscription;
    selectedProducts;

    @track orderItems;
    //orderItemsData = orderItems.values();
    
    @wire(MessageContext)
    messageConx;

    connectedCallback(){
        console.log('connectedCallback()');
        this.subscription = subscribe(this.messageConx, SELECTED_PRODUCTS, (message) => this.handleMessage(message), {scope: APPLICATION_SCOPE});
    }

    //get already existing order items
    @wire(getOrderItems, {orderId: '$recordId'})
    getOrderProducts(value){
        let tempOrderItems = [];
        const {error, data} = value;
        if(error){
            console.debug('...getOrderProducts() error', error);
        }
        if(data){
            data.forEach(item => {
                tempOrderItems.push({id: item.Id,
                                     productId: item.Product2Id, 
                                     productName: item.Product2.Name, 
                                     productFamily: item.Product2.Family ? item.Product2.Family: '',//fill products with families
                                     unitPrice: item.UnitPrice, 
                                     quantity: item.Quantity,
                                     totalPrice: item.TotalPrice});
            });
            console.debug('...getOrderProducts() data', tempOrderItems);
            this.wiredOrderProducts = value;
            this.orderItems = tempOrderItems;
            console.debug('...getOrderProducts() orderItems', this.orderItems);
        }
    }
    
    handleMessage(msgData){

        this.selectedProducts = msgData.data;
        console.debug('...selectedProducts',this.selectedProducts);
        this.updateOrderItems(this.selectedProducts);
    }

    updateOrderItems(products){
        //when Add clicked and the table contains no data, add all products with Quantity 1 and Total Price 
        let tempProducts = [];
        console.debug('...updateOrderItems orderItems',this.orderItems.length);
        console.debug('...updateOrderItems products',products.length);

        let orderItemsHolder = this.orderItems;
        let orderItemsLength = orderItemsHolder.length;

        if((orderItemsLength === 0) && (products.length > 0)){
            products.forEach(product => {
                product.quantity = 1;
                product.totalPrice = product.listPrice;
                tempProducts.push(product);
            });
            this.orderItems = tempProducts;
            console.debug('...updateOrderItems with no data',this.orderItems);

        }else if((orderItemsLength > 0) && (products.length > 0)){

            //when Add clicked and some items in the table exist and some not
            //for the same product increment Quantity and recalculate Total Price,
            console.debug('...updateOrderItems with same product entered');
            //finding a products by productId in orderItems
            let tempNewItems = [];
            for(let index = 0; index < orderItemsLength; index++){
                
                let product = products.find(product => { product.id === orderItemsHolder[index].Product2Id;});
                if(product){
                    this.orderItems[index].quantity++;
                    this.orderItems[index].totalPrice = this.calculateTotalPrice(orderItemsHolder[index]);
                }else{
                    //add new product into array with Quantity 1 and Total Price
                    tempNewItems.push({ productId: product.Id, 
                                        productName: product.Name, 
                                        productFamily: product.Family ? product.Family: '',//fill products with families
                                        unitPrice: product.listPrice, 
                                        quantity: 1,
                                        totalPrice: listPrice});
                }
            }
            if(tempNewItems.length > 0){

                //add new product into table with Quantity = 1  and Total Price
                this.orderItems.push(tempNewItems.values());
                console.debug('...updateOrderItems, no such product added', this.orderItems);
            }
        }
    }

    calculateTotalPrice(orderItem) {
        orderItem.totalPrice = orderItem.quantity * orderItem.unitPrice;
        return orderItem.totalPrice;
    }

    deleteItems() {
        //TODO: remove items when Remove button clicked
        const selectedItems = this.template.querySelector('div[data-id="orderItemTable"] > lightning-datatable').getSelectedRows();
    }

    saveItems(){
        //TODO: save items when Save button clicked
        const selectedItems = this.template.querySelector('div[data-id="orderItemTable"] > lightning-datatable').getSelectedRows();
        refreshApex(this.wiredOrderProducts);
    }

    disconnectedCallback(){
        unsubscribe(this.subscription);
        this.subscription = null;
        console.debug('...orderItems disconnectedCallback()');
    }
}