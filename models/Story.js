// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model(
  'Story',
  new Schema({author: { type: Schema.Types.ObjectId, ref: 'Person' },title:String,fans: [{ type: Schema.Types.ObjectId, ref: 'Person' }],created_at:{type : Date,default : Date.now},updated_at:{type : Date,
   default : Date.now}},{strict: false}),
  'Story'
);


// explantation

//here we specify type as objectid and ref to the person..so when we add data to story we have to add person _id to the author field.

// now how populate works.//
////////////////////////////

/* 

Story.find().populate('author).exec()
it findout author with refernce(Person) in the Person model and give combined result. 

*/
