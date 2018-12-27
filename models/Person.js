// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model(
  'Person',
  new Schema({name:String,age:String,stories: [{ type: Schema.Types.ObjectId, ref: 'Story' }], created_at:{type : Date,default : Date.now},updated_at:{type : Date,
   default : Date.now}},{strict: false}),
  'Person'
);
