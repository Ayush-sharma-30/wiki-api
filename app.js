//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");

const app = express();

app.set('view engine','ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect('mongodb://127.0.0.1:27017/wikiDB',{useNewUrlParser: true});

const articleSchema = {
  title : String,
  content : String
};

const Article  = mongoose.model("Article", articleSchema);

//////////////////////////////Request targeting all articles////////////////////////////

app.route("/articles")
  .get(function (req, res) {
  Article.find().then((data) => {
    //console.log(data);
    res.send(data); // Sending the data as the response
  }).catch((error) => {
    console.error(error);
    res.status(500).send("Internal Server Error");
  });
})
.post(function(req,res){
  var title = req.body.title;
  var content = req.body.content;
  const newArticle = new Article({
    title: title,
    content: content
  });
  newArticle.save().then(()=>{
    res.send("Saved successfully");
  }).catch((err)=>{
    console.log(err);
  });
})
.delete(function(req,res){
  Article.deleteMany().then(()=>{
    res.send("Deleted");
    console.log("Deleted");
  }).catch((err)=>{
    res.status(500).send("Internal Server error");
    console.log(err);
  });
});

//////////////////////////////Request targeting specific articles////////////////////////////

app.route("/articles/:articleTitle")
  .get(function(req,res){
    //to avoid any trailing spaces
    const trimmedTitle = req.params.articleTitle.trim();
    //reg expression is used to handle uneven casing of search
    Article.findOne({title: { $regex: new RegExp(trimmedTitle, "i") }}).then((data)=>{
      if(data)
      res.send(data);
      else res.send("No article found");
    }).catch((err)=>{
      res.status(500).send("Internal server error");
    });
  })
  .put(async function(req, res) {
    try {
      //to avoid any trailing spaces
      const trimmedTitle = req.params.articleTitle.trim();
      //reg expression is used to handle uneven casing of search
      const result = await Article.updateOne(
        { title: { $regex: new RegExp(trimmedTitle, "i") }},
        { title: req.body.title, content: req.body.content }
      );
      if (result.modifiedCount === 1) {
        res.send("Update successful");
      } else {
        res.status(404).send("No article found");
      }
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  })
  .patch(async function(req,res){
    try{
      const trimmedTitle = req.params.articleTitle.trim();
      const result = await Article.updateOne(
        {title: {$regex: new RegExp(trimmedTitle,"i")}},
        {$set: req.body}
      );
      if(result.modifiedCount === 1){
        res.send("Patched completely");
      }else{
        res.status(404).send("No article found");
      }
    }catch(err){
      res.status(500).send("Internal server error");
    }
  })
  .delete(function(req,res){
        const trimmedTitle = req.params.articleTitle.trim();
        Article.deleteOne(
          {title: {$regex: new RegExp(trimmedTitle,"i")}}
        ).then(()=>{
          res.status(200).send("Successfully deleted");
        }).catch((err)=>{
          res.status(500).send("Internal server error");
        });
  });

app.listen(3000,function(){
  console.log("Server started on port 3000");
});
