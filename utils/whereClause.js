// understand the where clause

// Base - Product.find()
// BigQ

// TODO: revise it once more
class WhereClause {
    
    constructor(base, bigQ) {
        this.base = base;
        this.bigQ = bigQ;
    }

    search() {
        // search from name of either product user
        const searchWord = this.bigQ.search ? {
            name: {
                $regex: this.bigQ.search,
                $options: 'i'
            }
        } : {};

        this.base = this.base.find({...searchWord});
        return this;
    }

    filter() {
        // TODO: do a demo code and check spread operator supports deep copy or not!!!
        const copyQ = {...this.bigQ};

        delete copyQ['search'];
        delete copyQ['limit'];
        delete copyQ['page'];

        let _strOfCopyQ = JSON.stringify(copyQ);
        _strOfCopyQ = _strOfCopyQ.replace(/\b(gte|lte|gt|lt)\b/g, m => `$${m}`);

        const jsonOfCopyQ = JSON.parse(_strOfCopyQ);

        this.base = this.base.find(jsonOfCopyQ);
        return this;
    }

    pager(resultPerPage) {
        // apply pagination understand it
        let currentPage = 1;

        if (this.bigQ.page) {
            currentPage = this.bigQ.page;
        }

        const skipVal = resultPerPage * (currentPage - 1);

        this.base = this.base.limit(resultPerPage).skip(skipVal);
        return this;
    }
}

module.exports = WhereClause;