var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use(express.static(__dirname+"/applePublic"))
var SellerModel = require("./seller.model")
var UserModel = require("./user.model")

var jwt = require('jsonwebtoken');
const e = require('express');
const { json } = require('express');

app.post("/login",function(req,res){

  UserModel
  .find({username:req.body.username,password:req.body.password})
  .then((users)=>{
    if(users.length===0){
      res.send({message:'wrongcredentials'})
    }
    else{
      console.log(users[0])
      var user = {username:users[0].username,level:users[0].level}
      var token = jwt.sign({...user},"sowmya123") 
      res.send({message:'success',token,level:user.level,username:users[0].username})
    }
  }).catch((err)=>{console.log("err::",err)})
})

app.post("/addSeller",(req,res)=>{
  console.log(req.body)
  var newSeller = new SellerModel(req.body)
  newSeller.save();
  res.send("please wait")
})
app.get("/sellerList",(req,res)=>{
  SellerModel.find({}).then((sellers)=>{
    res.send(sellers)
    // res.render("sellerlist.pug",{sellers:sellers})
  }).catch((err)=>{console.log(err)})
})

// app.get("/approveSellerList",(req,res)=>{
//   SellerModel.find({}).then((sellers)=>{
//     //res.send(sellers)
//     res.render("sellerapprovelist.pug",{sellers:sellers})
//   }).catch((err)=>{console.log(err)})
// })

function checkLevel(req,res,next){
  console.log(req.params)
  var user = jwt.verify(req.params.token,'sowmya123')
  if(user.level===4){
    next()
  }
  else{
    res.send({message:'notauthorised'})
  }
}

app.get("/approveSeller/:id/:token",checkLevel,(req,res)=>{
  SellerModel.findOneAndUpdate({GSTIN:req.params.id},{status:'approved'})
  .then((doc)=>{
    res.send({message:"approved"})
  }).catch((err)=>{console.log("err",err)})
})
app.get("/checkSeller/:id",(req,res)=>{
  SellerModel.find({GSTIN:req.params.id})
  .then((doc)=>{
    console.log("doc",doc)

    if(doc.length===0){
      res.send({'message':'please apply'})
    }
    else{
      if(doc[0].status==='approved'){
        res.send({'message':'approved'})
      }
      else{
        res.send({'message':'please wait for approval'})
      }
    }
  }).catch((err)=>{console.log("err",err)})
})
app.listen(4000,()=>{console.log('server runnning on 4000')})