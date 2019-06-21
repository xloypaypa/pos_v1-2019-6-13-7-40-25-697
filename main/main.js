'use strict';

function printReceipt(tags) {
    const itemMap = getAllItemMap();
    const itemCount = getItemCount(tags);
    const originalPriceList = buildOriginalPriceList(itemCount, itemMap);
    const promotionsMap = getPromotionsMap();
    const realPriceList = buildRealPriceList(originalPriceList, promotionsMap);
    const total = calculateTotalPriceAndDiscount(realPriceList);
    showReceipt(realPriceList, total);
}

function formatDecimal(decimal) {
    return parseFloat(decimal).toFixed(2);
}

function showReceipt(realPriceList, total) {
    let receipt = "***<没钱赚商店>收据***\n";
    for (let i = 0; i < realPriceList.length; i++) {
        const realPrice = realPriceList[i];
        receipt += "名称：" + realPrice.itemDetail.name +
            "，数量：" + realPrice.count + realPrice.itemDetail.unit + "，" +
            "单价：" + formatDecimal(realPrice.itemDetail.price) + "(元)，" +
            "小计：" + formatDecimal(realPrice.realPrice) +"(元)\n";
    }
    receipt+="----------------------\n";
    receipt+="总计："+ formatDecimal(total.totalPrice) +"(元)\n";
    receipt+="节省：" + formatDecimal(total.discount) +"(元)\n";
    receipt += "**********************";
    console.log(receipt);
}

function calculateTotalPriceAndDiscount(realPriceList) {
    let discount = 0;
    let totalPrice = 0;
    for (let i = 0; i < realPriceList.length; i++) {
        const realPrice = realPriceList[i];
        discount += realPrice.originalPrice - realPrice.realPrice;
        totalPrice += realPrice.realPrice;
    }
    return {totalPrice: totalPrice, discount: discount};
}

function buildRealPriceList(originalPriceList, promotionsMap) {
    const result = [];
    for (let i = 0; i < originalPriceList.length; i++) {
        const originalPrice = originalPriceList[i];
        const discountFunction = promotionsMap[originalPrice.key] || noDiscount;
        result.push(discountFunction(originalPrice));
    }
    return result;
}

function getPromotionsMap() {
    const promotions = loadPromotions();
    const result = {};
    for (let i = 0; i < promotions.length; i++) {
        for (let j = 0; j < promotions[i].barcodes.length; j++) {
            if (promotions[i].type === 'BUY_TWO_GET_ONE_FREE') {
                result[promotions[i].barcodes[j]] = buyTwoGetOneFreeDiscount;
            }
        }
    }
    return result;
}

function noDiscount(originalPrice) {
    const realPrice = JSON.parse(JSON.stringify(originalPrice));
    realPrice['realPrice'] = realPrice['originalPrice'];
    return realPrice;
}

function buyTwoGetOneFreeDiscount(originalPrice) {
    const realPrice = JSON.parse(JSON.stringify(originalPrice));
    realPrice['realPrice'] = realPrice.originalPrice - parseInt(realPrice.count / 3) * realPrice.itemDetail.price;
    return realPrice;
}

function buildOriginalPriceList(itemCount, itemMap) {
    const result = [];
    for (let i = 0; i < itemCount.length; i++) {
        result.push({
            key: itemCount[i].key,
            count: itemCount[i].count,
            itemDetail: itemMap[itemCount[i].key],
            originalPrice: itemCount[i].count * itemMap[itemCount[i].key].price
        })
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
