// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderSchema = new Schema({
    customer:[{ type: Schema.Types.ObjectId, ref: 'Customer' }],
    product: [{ type: Schema.Types.ObjectId, ref: 'Products' }]
});

var Order = mongoose.model('Order', orderSchema);

module.exports = Order