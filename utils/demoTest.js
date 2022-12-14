// some basics which needs to be refreshed from my side
Product.find({stock: {$gt: 20}});

`
/api/v1/product?search=tshirt&page=2&category=shortsleeves&rating[gte]=4&price[lte]=1999&price[gte]=100
`

// const p = 'gte gte lte mygte';
// const regex = /\b(gte|lte)\b/g;
// console.log(p.replace(regex, m => `$${m}`));