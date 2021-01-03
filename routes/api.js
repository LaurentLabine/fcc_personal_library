'use strict';
const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookSchema = new Schema({
title: String,
commentcount: {type: Number, default: 0},
comments: [String]
})

const Book = mongoose.model("Book", bookSchema, "PersonalLibrary")


module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      Book.find({}, (err,doc) => {
        if(err) return console.error(err)
        return res.json(doc)
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;
      
      if(!title)
        return res.send("missing required field title")

          let newBook = new Book({title: title})
          newBook.save((err, doc) => {
            if(err) return console.error(err)
            res.json({title:doc.title,_id: doc._id})
          })
    })
    
    .delete(function(req, res){
      Book.deleteMany({}, (err, doc) => {
        if(err) console.error(err)
        return res.send("complete delete successful")
      })
    });

  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      // console.log("bookId length : " + bookid.length)

      if(bookid.length === 0)
      return res.send("missing required field ID")

      Book.findOne({_id: bookid}, (err, doc) => {
        if(err) console.error(err)
        if(doc === null) {//Book doesn<t exist.  Creating new one
          res.send("no book exists")
        } else{
          return res.json(doc)
        }
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (comment !== undefined){
        

        Book.updateOne({_id: bookid},
          {
              "$push" : { 
                  "comments" : comment
              },
              "$inc": { "commentcount": 1 } 
          },
          (err, doc) => {
            if(err) return console.error(err)

            if(doc.nModified === 0)
            return res.send("no book exists")
            
            Book.findOne({_id: bookid}, (err, doc) => {
              if(err) console.error(err)
                return res.json(doc)
              })
          })
      }
      else
        res.send("missing required field comment")
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;

      //Pull request documentation :      // https://www.tutorialspoint.com/mongodb-query-to-remove-subdocument-from-document
      Book.deleteOne({ _id: bookid }, (err, doc) => {
        if(err) console.error(err);

        if(doc.n === 0)
          return res.send("no book exists")

        res.send("delete successful");
      });
    });
  
};
