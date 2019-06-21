'use strict';

function printReceipt(tags) {
    const itemMap = getAllItemMap();
    console.log(itemMap)
}

function getAllItemMap() {
    const itemList = loadAllItems();
    const result = {};
    for (let i = 0; i < itemList.length; i++) {
        result[itemList[i].barcode] = itemList[i];
    }
    return result;
}
