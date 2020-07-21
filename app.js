//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser")
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Swapnil:airbuddies01@cluster0.4pb0z.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology:true});

const itemSchema = {
  name:String
};

const Item = mongoose.model("Item",itemSchema);

const listSchema = {
  name:String,
  items: [itemSchema]
};
const List = mongoose.model("List",listSchema);

const item1 = new Item({
  name:"Welcome to your todolist!!"
});

const item2 = new Item({
  name:"Use + to add a new item"
});

const item3 = new Item({
  name:"Toggle checkbox to remove item"
});

const defaultItems =[item1,item2,item3];

app.get("/", function(req, res) {
 Item.find(function(err,foundItems){
   if(err){
     console.log(err);
   }
   else if(foundItems.length===0){
     Item.insertMany(defaultItems,function(err){
  if(err){
    console.log(err);
  }
  else{
    console.log("Inserted Successfully");
  }
});
res.redirect("/");
   }
   else {
     res.render("list",{listTitle:"Today",newListItems:foundItems});
   }
 });
});

app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(err){
      console.log(err);
    }
    else if(!foundList){
      console.log(foundList);
        const list = new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
    }
    else{
      console.log(foundList);
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
  });
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
  
});

app.post("/delete", function(req, res){
  const itemID = req.body.check;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(itemID,function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }
  else{ 
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:itemID}}},function(err,foundList){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/"+listName);
      }
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started successfully");
});
