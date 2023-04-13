const express = require("express")
const app = express()
const PORT = 3000
const hbs = require("express-handlebars")
const Datastore = require("nedb")
const bodyParser = require('body-parser')
const path = require("path")


const dataBase = new Datastore({
    filename:"./data/cars.db",
    autoload: true
})


app.set("views",path.join(__dirname,"views"))
app.engine("hbs",hbs({
    defaultLayout: 'main.hbs',
    extname: '.hbs',
    partialsDir: "views/partials",
}))
app.set("view engine","hbs")
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())


app.get("/",(req,res)=>{

    res.render("title.hbs")
})



app.get("/add",(req,res)=>{

    res.render("add.hbs")
})

app.post("/add",(req,res)=>{
    const doc = {
        insurance: req.body.insurance != undefined ? "TAK" : "NIE",
        gasoline: req.body.gasoline != undefined ? "TAK" : "NIE",
        damaged: req.body.damaged != undefined ? "TAK" : "NIE",
        drive: req.body.drive != undefined ? "TAK" : "NIE"
    }

    dataBase.insert(doc, (err, newDoc) => {
        res.render("add.hbs",{newId:newDoc._id})
    });
})

app.get("/show",(req,res)=>
{
    dataBase.find({},(err,docs)=>{
        res.render("show.hbs",{data:docs})
    })
})

app.post("/show",(req,res)=>
{   
    dataBase.remove({_id:req.body.id},(err,numRemove)=>{
        dataBase.find({},(err,docs)=>{
            res.render("show.hbs",{data:docs, delId:req.body.id})
        })
    })
})

app.get("/edit",(req,res)=>
{
    if(req.query.id != undefined)
    {
        dataBase.find({},(err,docs)=>{
            const context = docs.map((obj)=>{
                return obj._id == req.query.id ? Object.assign({},obj,{selected:true}) : obj
            })
            res.render("edit.hbs",{data:context})
        })
    }
    else
    {
        dataBase.find({},(err,docs)=>{
            res.render("edit.hbs",{data:docs})
        })
    }
})

app.post("/edit",(req,res)=>
{
    const doc = {
        insurance: req.body.insurance,
        gasoline: req.body.gasoline,
        damaged: req.body.damaged,
        drive: req.body.drive
    }
    dataBase.update({ _id: req.body.updateId }, { $set: doc }, {}, function (err, numUpdated) {
        dataBase.find({},(err,docs)=>{
            res.render("edit.hbs",{data:docs,updateId:req.body.updateId})
        })
     });
})



app.use(express.static("static"))
app.listen(PORT,()=>
{
    console.log("Server działa!")
})