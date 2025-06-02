import { LightningElement, wire} from 'lwc';
import getAvailableAllStdPrcBookProducts from '@salesforce/apex/LwcHelper.getAvailableAllStdPrcBookProducts';

//import PRODUCT_NAME from '@salesforce/schema/Product2.Name';
//import UNIT_PRICE from '@salesforce/schema/PricebookEntry.UnitPrice';

const columns = [{label: 'Name', fieldName: 'productName', type: 'text'},
                 {label: 'List Price', fieldName: 'listPrice', type: 'number'}];//no data because NO ALL cols are listed, but data returned more fields 

export default class AvailableProducts extends LightningElement {

    productData;
    columnInfos = columns;

    @wire(getAvailableAllStdPrcBookProducts)
    getApexProductData({error, data}){
        this.productData = [];
        if(error){
            console.debug('...caught wire error: ', error);
        }
        if(data){
            console.debug('...data recieved', data);
            data.forEach(elem => {
                this.productData.push({ id: elem.Product2Id, productName: elem.Product2.Name, listPrice: elem.UnitPrice});
            });
        }
    }
}