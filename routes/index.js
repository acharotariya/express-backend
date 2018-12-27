var express = require('express');
var app = express();
var bodyParser = require('body-parser')
const { hashSync, compareSync } = require('bcrypt');
const Users = require('../models/users');
const Items = require('../models/items');
const Person = require('../models/Person');
const Customer = require('../models/customer');
const Products = require('../models/products');
const Order = require('../models/orders');
const Story = require('../models/Story');
const db = require('../models/db');
const { secret } = require('../config');
const { sign, verify } = require('jsonwebtoken');
var path = require('path');
var router = express.Router();
var cookieParser = require('cookie-parser');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});


// parse application/json
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(cookieParser());

// router.use(express.static(__dirname + '/public'));
// router.set('views', path.join(__dirname, 'views'));
// router.set('view engine', 'ejs');
// let str= "";


// app.get('/', function (req, res) {
//     // res.send("Hello world!");
//     res.sendFile('index.html');
// });

async function checkauthentication (req,res,next) {
    console.log("checkauthentication called")
    const token = req.headers.authorization
    if(token == '' || token == null) {
        res.send({message: 'Missing authorization token'})
    }else{
      try{
    let decoded = await verify(token, secret)
    console.log('decoded',decoded)
    console.log('verified succesfully')
    next()
  }catch(err){
    console.log('err ==============', err)
    res.status(401).send({error: err})
  }
    }
}

let getUsername = function (username) {
    promise = new Promise(function (resolve, reject) {
        Users.find({ username: username }).exec().then((users, err) => {
            if (users.length) {
                reject('That username already exist');
            } else {
                resolve('not exist')
            }
        })
    })

    return promise;
}

router.post('/signup', async function (req, res) {
    console.log(req.body)
    getUsername(req.body.username).then(async (result) => {
        let user = new Users({ username: req.body.username, password: hashSync(req.body.password, 2) });
        user = await user.save();
        console.log("user", user)
        res.send(JSON.stringify({ status: 1, code: 200, message: 'you are successfully register...' }));
    }).catch((err) => {
        console.log("err >>>>>>>>>>>>>>", err)
        res.status(409);
        res.send(err);
    })
});


router.post('/customer', async function (req, res) {
    console.log(req.body)
        let customer = new Customer({ name: req.body.name, address: req.body.address });
        customer = await customer.save();
        console.log("customer", customer)
        res.send({ status: 1, code: 200, message: 'you are successfully register...' });
});

router.post('/products', async function (req, res) {
    console.log(req.body)
        let products = new Products({ product_name: req.body.product_name, product_price: req.body.product_price });
        products = await products.save();
        console.log("products", products)
        res.send({ status: 1, code: 200, message: 'successfully add products...' });
});

router.post('/orders', async function (req, res) {
    console.log(req.body)
        let order = new Order({ customer_id: req.body.customer_id, product_id: req.body.product_id });
        order = await order.save();
        console.log("order", order)
        res.send({ status: 1, code: 200, message: 'successfully add order...'});
});


/* (-_id) is excluded from responses
   customer and product is foreign key(ref) in orderschema
   populate useful for join multiple collection
*/
router.get('/orders/:id', async function (req, res) {
    let orderId = req.params.id

    Order.findOne({ _id: orderId }).populate({ path: 'customer', select: 'name address -_id' }).
    populate({ path: 'product', select: 'product_name product_price -_id' }).
  exec(function (err, order) {
    if (err) return handleError(err);
    console.log('order', order)

    res.send({'order': order})
    // console.log('The author is %s', story.author.name);
    // prints "The author is Ian Fleming"
  });
})

let attempt = function (username, password) {
    promise = new Promise(function (resolve, reject) {
        Users.find({ username: username }).exec().then((users) => {
            console.log("users", users)
            if (!users.length) {
                // res.status(401);
                reject("That user does not exist");
                // throw createError(401, 'That user does not exist');
            } else {
                const user = users[0];
                if (!compareSync(password, user.password)) {
                    // res.status(401);
                    reject("password doesn't match");
                    // throw createError(401, "password doesn't match");
                } else {
                    resolve(user);
                }
            }
        })
    })
    return promise;
};

router.post('/login', async function (req, res) {

    attempt(req.body.username, req.body.password).then(async (data) => {

        payload = {
            "userId": data._id,
            "iat": Math.floor(Date.now() / 1000) - 30,
            "exp": Math.floor(Date.now() / 1000) + (60 * 60),
            "aud": "https://yourdomain.com",
            "iss": "feathers",
            "sub": "anonymous"
        }
        let token = await sign(payload, secret);
        res.status(200).send({ message: 'you are successfully login...' ,logintoken:token});

    }).catch((err) => {
        res.status(401).send({ message: 'Authentication failed.Try again...' ,error:err});
    })
})

// protected route with verify token
// checkauthentication is middleware function
router.post('/AddItem', checkauthentication, async function (req, res) {
    console.log("req", req.body.fruit)
    let item = new Items({ fruit: req.body.fruit, price: req.body.price });
    itemdata = await item.save();
    console.log("itemdata", itemdata)
    res.status(201).send({message:"Add item succesfully",data:itemdata})
    // res.send(itemdata)
    // res.redirect('/view')
})

// route only for paginate of record
router.get('/getitem', checkauthentication , async function (req, res) {
    try{
      console.log(parseInt(req.query.page))
      var pageOptions = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10
    }
    console.log('pageOptions', pageOptions)
    
    await Items.find()
        .skip(pageOptions.page*pageOptions.limit)
        .limit(pageOptions.limit)
        .exec(function (err, doc) {
            if(err) { res.status(500).json(err); return; };
            res.status(200).json(doc);
        })
    }catch(err) {
        res.send(err)
    }
});

router.get('/getAllItem', checkauthentication , async function (req, res) {
      //  sorting= 1( ascending )
      //  sorting= -1( descending )
      //  limit(size) => limit the record per page
      let data = await Items.find({})
      res.send(data)
});

router.post('/UpdateItem/(:id)', checkauthentication, async function (req, res) {
    console.log("UpdateItem", req.body)
    query = { _id: req.params.id }
    const update = {
        $set: { "fruit": req.body.fruit, "price": req.body.price, "updated_at": new Date() }
    };
    let up = await Items.findOneAndUpdate(query, update, { returnNewDocument: true, new: true })
    res.status(200).send({message:"UpdateItem item succesfully",data: up })
})

router.get('/DeleteItem/(:id)', checkauthentication, async function (req, res) {
    console.log("req", req.params.id)
    let items = await Items.find({ _id: req.params.id });
    let data = items[0];
    if (items.length == 0) {
        res.status(401);
        res.send("item not exist");
    } else {
        query = { _id: req.params.id }
        let data = await Items.findOneAndRemove(query)
        console.log("data", data)
        res.status(200).send({message:"DeleteItem item succesfully",data: data })
    }
})

router.post('/adddetails',async function (req, res) {
  try{
  let person = new Person({ name: req.body.name, age: req.body.age });
  data = await person.save();
  console.log('data', data)
  let story = new Story({ author: data._id, title: req.body.title });
  storydata = await story.save();
  console.log('storydata', storydata)
  res.status(201).send({"message":"add details succesfully","person": data,"story": storydata})
  }catch(err){
    res.send(err)
  }
})

router.get('/getjoin', async function (req, res) {
  // Story.findOne({ title: 'the life' }).populate('author').
  // exec(function (err, story) {
  //   if (err) return handleError(err);
  //   console.log('story', story)
  //   console.log('The author is %s', story.author.name);
  //   // prints "The author is Ian Fleming"
  // });

//  let result = await Story.
//   find({"title":"one man army"}).
//   populate({ path: 'fans', select: 'name' }).
//   populate('author').
//   exec();

//   console.log('result', result)
//   res.send(result)
// let result = await Story.
//   find().
//   populate('author').
//   exec();

//   console.log('result', result)
//   res.send(result)
})

router.put('/Updatestoryfans/(:id)', async function (req, res) {
  console.log("UpdateItem", req.body)
  query = { _id: req.params.id }
  const update = {
      $set: { "fruit": req.body.fruit, "price": req.body.price, "updated_at": new Date() }
  };
  let up = await Items.findOneAndUpdate(query, update, { returnNewDocument: true, new: true })
  res.status(200).send({message:"UpdateItem item succesfully",data: up })
})


module.exports = router;
