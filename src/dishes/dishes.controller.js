const path = require("path");
const { findIndex } = require("../data/dishes-data");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function list(req , res , next ){
    res.json({data: dishes})
} 
// create and it validation function  
function postValidation (req , res , next){

const {data : {name ,description , price , image_url}={}} = req.body;

if( !name || !description || !price || !(typeof price === 'number')|| price<0 || !image_url){
    let missing = !name? "name" : !description? "description" : !price? "price"  : (  !(typeof price === 'number')|| price<0 )? "Dish must have a price that is an integer greater than 0" : "image_url"
    next({
        status:400,
        message: `Dish must include a ${missing}`
    })
} else {
    let result = {
        name ,description , price , image_url,
        id: nextId() 
    }
    res.locals.dish = result;
    next()
}
}

function create(req , res , next){
dishes.push(res.locals.dish )
res.status(201).json({ data : res.locals.dish })
}
// read and it validation function 
function validation (req , res , next){
const { dishId } = req.params
const isExist = dishes.find((dish)=> dish.id == dishId)
res.locals.dish = isExist;
isExist  ? next() : next({
    status: 404 , 
    message : `Dish does not exist: ${dishId}.`
}) 
}

function read (req , res , next){
res.json({
    data: res.locals.dish
})
}
// update and it validation function 
function updateValidation (req , res , next){
    const { dishId } = req.params
    const { data } = req.body
    const isExist = dishes.find((dish )=> dish.id == dishId);
    const index = dishes.findIndex((dish )=> dish.id == dishId)
    
       if( dishId !== data.id && data.id ){
        next({
                status: 400 , 
                message : `Dish id does not match route id. Dish: ${data.id}, Route: ${dishId}`
            })  
    } else if (isExist){
        data.id = dishId
        res.locals.dish = data
        dishes[index] = data
        next()
    } 
    }

function update (req, res , next){
    res.status(200).json({ data : res.locals.dish })
}

module.exports = {
    list, 
    read: [validation , read ],
    create: [postValidation, create],
    update:[validation , postValidation ,updateValidation, update]
}