const fuelIds = [
    '5d1b371186f774253763a656', // Expeditionary fuel tank
    '5d1b36a186f7742523398433', // Metal fuel tank
];

function getCheapestItemPrice(item, useFlea) {
    let bestPrice = {};

    if (!item.buyFor) {
        console.log(item);

        return bestPrice;
    }

    item.buyFor.map((priceObject) => {
        if (priceObject.priceRUB > bestPrice.price) {
            return true;
        }

        if (priceObject.source === 'fleaMarket' && !useFlea) {
            return true;
        }

        bestPrice.source = priceObject.source;
        bestPrice.price = priceObject.priceRUB;

        return true;
    });

    return bestPrice;
}

function getItemBarters(item, barters) {
    for (const barter of barters) {
        // if(barter.rewardItems.length > 1){
        //     continue;
        // }

        // if(barter.requiredItems.length > 1){
        //     continue;
        // }

        if (barter.rewardItems[0].item.id !== item.id) {
            continue;
        }

        return barter;
    }

    return false;
}

function getCheapestBarter(item, barters, useFlea = true) {
    const barter = getItemBarters(item, barters);
    let barterTotalCost = false;
    let bestPrice = {};

    if (barter) {
        barterTotalCost = barter.requiredItems.reduce(
            (accumulatedPrice, requiredItem) => {
                return (
                    accumulatedPrice +
                    getCheapestItemPrice(requiredItem.item, useFlea).price *
                        requiredItem.count
                );
            },
            0,
        );
    }

    if (barter && barterTotalCost) {
        bestPrice.price = barterTotalCost;
        bestPrice.source = 'barter';
        bestPrice.barter = barter;
    }

    return bestPrice;
}

function getCheapestItemPriceWithBarters(item, barters, useFlea = true) {
    const bestPrice = getCheapestItemPrice(item, useFlea);

    const barter = getItemBarters(item, barters);
    let barterTotalCost = false;

    if (barter) {
        barterTotalCost = barter.requiredItems.reduce(
            (accumulatedPrice, requiredItem) => {
                return (
                    accumulatedPrice +
                    getCheapestItemPrice(requiredItem.item, useFlea).price *
                        requiredItem.count
                );
            },
            0,
        );
    }

    if (
        barter &&
        barterTotalCost &&
        (!bestPrice.price || barterTotalCost < bestPrice.price)
    ) {
        bestPrice.price = barterTotalCost;
        bestPrice.source = 'barter';
        bestPrice.barter = barter;
    }

    // If we don't have any price at all, fall back to highest trader sell price
    if (!bestPrice.price) {
        // console.log(`Found no bestPrice for ${item.name}, falling back to trader value`);
        item.sellFor.map((priceObject) => {
            if (priceObject.priceRUB < bestPrice.price) {
                return true;
            }

            if (priceObject.source === 'fleaMarket' && !useFlea) {
                return true;
            }

            bestPrice.source = priceObject.source;
            bestPrice.price = priceObject.priceRUB;

            return true;
        });
    }

    return bestPrice;
}

const formatCostItems = (
    itemsList,
    hideoutManagementSkillLevel,
    barters,
    freeFuel = false,
    useFlea = true,
) => {
    return itemsList.map((requiredItem) => {
        let bestPrice = getCheapestItemPriceWithBarters(
            requiredItem.item,
            barters,
            useFlea,
        );
        let calculationPrice = bestPrice.price;

        let itemName = requiredItem.item.name;
        const isDogTag = requiredItem.attributes && requiredItem.attributes.some(att => att.name === 'minLevel');
        if (isDogTag) {
            const minLevel = requiredItem.attributes.find(att => att.name === 'minLevel').value;
            calculationPrice = calculationPrice * minLevel;
            itemName = `${itemName} ≥ ${minLevel}`;
        }

        if (freeFuel && fuelIds.includes(requiredItem.item.id)) {
            calculationPrice = 0;
        }
        
        let isTool = false;
        if (requiredItem.attributes)
            isTool = requiredItem.attributes.some(element => element.type === "tool");

        const returnData = {
            id: requiredItem.item.id,
            count:
                requiredItem.count === 0.66
                    ? (
                          requiredItem.count -
                          (requiredItem.count *
                              (hideoutManagementSkillLevel * 0.5)) /
                              100
                      ).toFixed(2)
                    : requiredItem.count,
            name: itemName,
            price: calculationPrice,
            priceSource: bestPrice.source,
            alternatePriceSource: bestPrice.barter,
            iconLink:
                requiredItem.item.iconLink ||
                'https://tarkov.dev/images/unknown-item-icon.jpg',
            wikiLink: requiredItem.item.wikiLink,
            itemLink: `/item/${requiredItem.item.normalizedName}`,
            isTool: isTool,
        };

        return returnData;
    });
};

export { getItemBarters, getCheapestItemPriceWithBarters, getCheapestBarter };

export default formatCostItems;
