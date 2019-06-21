'use strict';

function printReceipt(tags) {
    const itemMap = getAllItemMap();
    const itemCount = getItemCount(tags);
    const originalPriceList = buildOriginalPriceList(itemCount, itemMap);
    console.log(noDiscount(originalPriceList[0]));
}

function noDiscount(originalPrice) {
    const realPrice = JSON.parse(JSON.stringify(originalPrice));
    realPrice['realPrice'] = realPrice['originalPrice'];
    return realPrice;
}

function buildOriginalPriceList(itemCount, itemMap) {
    const result = [];
    for (let i = 0; i < itemCount.length; i++) {
        result.push({key: itemCount[i].key, itemDetail: itemMap[itemCount[i].key], originalPrice: itemCount[i].count * itemMap[itemCount[i].key].price})
    }
    return result;
}

function convertTagToItemCountDelta(tag) {
    if (tag.indexOf("-") !== -1) {
        return {key: tag.split("-")[0], countDelta: parseFloat(tag.split("-")[1])};
    } else {
        return {key: tag, countDelta: 1};
    }
}

function getItemCount(tags) {
    const result = [];
    for (let i = 0; i < tags.length; i++) {
        const item = convertTagToItemCountDelta(tags[i]);
        let exist = false;
        for (let j = 0; j < result.length; j++) {
            if (result[j].key === item.key) {
                result[j].count += item.countDelta;
                exist = true;
                break;
            }
        }
        if (!exist) {
            result.push({key: item.key, count: item.countDelta});
        }
    }
    return result;
}

function getAllItemMap() {
    const itemList = loadAllItems();
    const result = {};
    for (let i = 0; i < itemList.length; i++) {
        result[itemList[i].barcode] = itemList[i];
    }
    return result;
}
