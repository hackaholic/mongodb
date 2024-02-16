// Mongodb aggregate Lookup Practice

use practice;
db.createCollection('test');

db.orders.insertMany([
    { "_id": 1, "item": "almonds", "price": 12, "ordered": 2 },
    { "_id": 2, "item": "pecans", "price": 20, "ordered": 1 },
    { "_id": 3, "item": "cookies", "price": 10, "ordered": 60 }
]);

db.inventory.insertMany([
    { "_id": 1, "sku": "almonds", "description": "product 1", "instock": 120 },
    { "_id": 2, "sku": "bread", "description": "product 2", "instock": 80 },
    { "_id": 3, "sku": "cashews", "description": "product 3", "instock": 60 },
    { "_id": 4, "sku": "pecans", "description": "product 4", "instock": 70 },
    { "_id": 5, "sku": null, "description": "Incomplete" },
    { "_id": 6 }
]);


/*
$lookup
Performs a left outer join to a collection in the same database to filter in documents from the "joined" collection for processing. 
The $lookup stage adds a new array field to each input document
*/

/*
 Equality Match with a Single Join Condition
{
   $lookup:
     {
       from: <collection to join>,
       localField: <field from the input documents>,
       foreignField: <field from the documents of the "from" collection>,
       as: <output array field>
     }
}
*/

db.orders.aggregate([{
    $lookup: {
        from: "inventory",
        localField: "item",
        foreignField: "sku",
        as: "inventory"
    }
}]);

/* In MongoDB, a correlated subquery is a pipeline in a $lookup stage that references document fields from a joined collection
let Optional,  Specifies the variables to use in the pipeline stages.

To perform correlated and uncorrelated subqueries with two collections, and perform other join
use beow $lookup syntax
let -> Specifies variables to use in the pipeline stages. Use the variable expressions to access the fields from the joined collection's
 documents that are input to the pipeline.
 The let variables can be accessed by the stages in the pipeline, including additional $lookup stages nested in the pipeline.
 To reference variables in pipeline stages, use the "$$<variable>" syntax.
 A $match stage requires the use of an $expr operator to access the variables.
 
 
{
   $lookup:
      {
         from: <joined collection>,
         let: { <var_1>: <expression>, …, <var_n>: <expression> },
         pipeline: [ <pipeline to run on joined collection> ],
         as: <output array field>
      }
}
*/


// correlated query example
db.orders.aggregate([{
    $lookup: {
        from: "inventory",
        let: {order_item: "$item"},
        pipeline: [{
            $match : {$expr: {$eq: ["$$order_item", "$sku"]} }
        }],
        as: "inventory"
    }
}])


db.orders.aggregate([{
    $lookup: {
        from: "inventory",
        let: {order_item: "$item"},
        pipeline: [
            {$match : {$expr: {$eq: ["$$order_item", "$sku"]} }},
            {$match: {"instock": {$gt: 70}}}
        ],
        as: "inventory"
    }
}])


db.orders.aggregate([{
    $lookup: {
        from: "inventory",
        localField: "item",
        foreignField: "sku",
         pipeline: [
            {$match: {"instock": {$gt: 70}}}   // filter condition on foregin collection
        ],
        as: "inventory"
    }
}]);



db.classes.insertMany( [
   { _id: 1, title: "Reading is ...", enrollmentlist: [ "giraffe2", "pandabear", "artie" ], days: ["M", "W", "F"] },
   { _id: 2, title: "But Writing ...", enrollmentlist: [ "giraffe1", "artie" ], days: ["T", "F"] }
] );

db.members.insertMany( [
   { _id: 1, name: "artie", joined: new Date("2016-05-01"), status: "A" },
   { _id: 2, name: "giraffe", joined: new Date("2017-05-01"), status: "D" },
   { _id: 3, name: "giraffe1", joined: new Date("2017-10-01"), status: "A" },
   { _id: 4, name: "panda", joined: new Date("2018-10-11"), status: "A" },
   { _id: 5, name: "pandabear", joined: new Date("2018-12-01"), status: "A" },
   { _id: 6, name: "giraffe2", joined: new Date("2018-12-01"), status: "D" }
] );

/*
Use $lookup with an Array
If the localField is an array, you can match the array elements against a scalar foreignField without an $unwind stage.
*/

db.classes.aggregate([
    {
        $lookup: 
        {
            from: "members",
            localField: "enrollmentlist",
            foreignField: "name",
            as: "info",
        }      
    }
]);









