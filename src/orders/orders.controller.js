const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function list(req , res , next){
res.json({ data : orders})
}

// post 
 function postValidation(req , res , next){
const {data: {deliverTo, mobileNumber , dishes = [] }= {} } = req.body;
if(Array.isArray(dishes)){
dishes.forEach((dish, index)=> {
if(!dish.quantity ||dish.quantity<0  ||!(typeof dish.quantity === 'number') ){
    next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`
    })
}
})}

if(!deliverTo || !mobileNumber || !dishes || !dishes.length || !Array.isArray(dishes)){
let messing = !deliverTo? "a deliverTo" : !mobileNumber? "a mobileNumber" :(!dishes)? "a dishes" : 'at least one dish';
next({
    status: 400,
    message: `Order must include ${messing}`
})
} else {
    res.locals.create = req.body.data
    next()
}
 }
function create (req , res , next){
    res.locals.create.id= nextId()
    orders.push(res.locals.create)
    res.status(201).json({data : res.locals.create})

}
// read 
function isExist (req , res , next){
    const {orderId} = req.params;
    const order = orders.find((order)=> order.id== orderId )
    if(order){
        res.locals.order = order
        next()
    }else{
        next({
            status: 404 , 
            message : `order does not exist: ${orderId}.`
        })
    }
}

function read(req , res , next){
    res.json({ data: res.locals.order})
}
// update 

function updateValidation(req , res , next){
    const {data} = req.body;
    const {orderId} = req.params;
    if(data.id &&data.id !==orderId ){
      return   next({
            status:400,
            message: `Order id does not match route id. Order: ${data.id}, Route: ${orderId}.`
        })
    } else if (data.status === "delivered"){
      return   next({
            status:400,
            message: `A delivered order cannot be changed`
        }) 
    } else if(data.status === "pending" || data.status === 'preparing' ||data.status ===  'out-for-delivery' || data.status ===  'delivered')
    {
        data.id = orderId
        res.locals.update = data
        return  next()
    }
    else {
       next({
        status:400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`
    })
    }
}

function update (req , res , next){
    res.json({data : res.locals.update})
}
// delete and delete validation 

function deleteValidation (req, res , next){
    res.locals.order.status !== "pending" ? 
    next({
        status:400,
        message:'An order cannot be deleted unless it is pending'
    }) : 
    next()
}

function destroy(req , res , next){
    orders.splice(res.locals.index , 1);
    res.sendStatus(204)
} 

module.exports = {
    list,
    create: [postValidation, create],
    read: [isExist, read], 
    update: [ isExist , updateValidation  , postValidation, update],
    destroy:[isExist, deleteValidation ,destroy]
}