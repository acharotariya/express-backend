// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema({
    product_name: String,
    product_price: String
});

var Products = mongoose.model('Products', productSchema);

module.exports = Products