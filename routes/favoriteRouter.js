const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const Favorite = require('../models/favorites');
const Items = require('../models/items');
const cors = require('./cors');
const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,(req, res, next)=> {
    Favorite.findOne({user: req.user._id})
    .populate('user item')
    .exec(function(err, favorite) {
      if(err) throw err;
      res.json(favorite);
    });
  })

.post( cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    itemIds_fav= req.body;
    Favorite.findOne({ user: req.user._id }, function(err, favorite) {
        if(err) {
            return next(err);
        }
          if(! favorite || favorite.length === 0) {
            Favorite.create({
                user : req.user._id,
            })
            .then((fav) => {
                for (var i =0; i < itemIds_fav.length ; i++) {
                    if(fav.item.indexOf(itemIds_fav[i]._id) < 0){
                        fav.item.push(itemIds_fav[i]._id);
                        fav.save()
                        .then((fav) =>{
                            favorite.findById(fav._id).populate('user').populate('item')
                            .then((fav) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(fav);
                            })
                            
                        }, (err) => next(err))
                        .catch((err) => next(err));
                    }
                }
                
            }, (err) => next(err))
            .catch((err) => next(err));
          } else {
            for (var i =0; i < itemIds_fav.length ; i++) {
                if(favorite.item.indexOf(itemIds_fav[i]._id) < 0){
                    favorite.item.push(itemIds_fav[i]._id);
                    favorite.save()
                    .then((favorite) =>{
                        favorite.findById(favorite._id).populate('user').populate('item')
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(favorite);
                        })
                        
                    }, (err) => next(err))
                    .catch((err) => next(err));
                }
            }
          }
      });
});

favoriteRouter.route('/:itemId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser,(req, res, next)=> {
    Favorite.findOne({user: req.user._id})
    .then((fav) => {
        if(!fav){
            console.log(fav);
            res.statusCode = 200;
             res.setHeader('Content-Type', 'application/json');
            return res.json({"exists" : false, "favorites" : Favorite});
        }else{
            console.log(fav);
            if(fav.item.indexOf(req.params.itemId) < 0){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists" : false, "favorites" : fav});
            }else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
               return res.json({"exists" : true, "favorites" : fav});
            }
        }
    }, (err) => next(err))
    .catch((err) => next(err));
  })
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Items.findById(req.params.itemId)
    .then((item) => {
        if(item != null){
               Favorite.findOne({ user: req.user._id }, function(err, favorite) {
                    if(err) {
                        return next(err);
                    }
                    if(! favorite || favorite.length === 0) {
                    Favorite.create({
                        user : req.user._id,
                        item : req.params.itemId
                    })
                    .then((fav) => {
                        Favorite.findById(fav._id).populate('user').populate('item')
                        .then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        })
                    }, (err) => next(err))
                        .catch((err) => next(err));
                    } else {
                        if(favorite.item.indexOf(req.params.itemId) > -1) {
                            res.statusCode = 403;
                            res.setHeader('Content-Type', 'text/plain');
                            res.end(req.params.itemId +" is already in the favorite list!");
                        }else{
                                favorite.item.push(req.params.itemId);
                                favorite.save()
                                .then((fav) => {
                                    console.log(fav);
                                    favorite.findById(fav._id).populate('user').populate('item')
                                    .then((fav) => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(fav);
                                    })
                            }, (err) => next(err))
                            .catch((err) => next(err));
                        }
                  }
              });
        }
    }, (err) => next(err))
    .catch((err) => next(err))
})

.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next) => {
    Favorite.findOne({ user: req.user._id }, (err, favorite) => {
        if(err) {
            return next(err);
        }
        if(favorite.item.indexOf(req.params.itemId) >= 0) {
            favorite.item.splice(favorite.item.indexOf(req.params.itemId), 1);
            favorite.save()
            .then((fav) => {
                favorite.findById(fav._id).populate('user').populate('item')
                .then((fav) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                })
            }, (err) => next(err))
            .catch((err) => next(err))
        }
        else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Item '+req.params.itemId+" not in your favorite list !");
        }
    })
 });
 

/*
    var itemId_fav = {};
    if(req.params.itemId != null){
        itemId_fav= { id : req.params.itemId};
    }else if(req.body != null){
        itemId_fav= req.body;
    }
    //console.log(itemId_fav.length);
    for (var i = (itemId_fav.length -1); i >= 0; i--) {
        //item.comments.id(item.comments[i]._id).remove();
        console.log(itemId_fav[i]);
         Items.findById(itemId_fav[i].id)
        .then((item) => {
            if(item != null){
                Favorite.findOne({user: req.user._id }, (err, user) => {
                    if(err){
                        return done(err, false);
                    }
                    else if(user){
                        return done(null, user);
                    }else{
                       /* Favorite.create({
                            user : req.user._id
                           // item : itemId_fav[i]
                        })
                        Favorite.user = req.user._id;
                        Favorite.item.push(itemId_fav[i]);
                        Favorite.save()
                        .then((fav) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(fav);
                        }, (err) => next(err))
                            .catch((err) => next(err))
                    }
                }, (err) => next(err))
                .catch((err) => next(err))
            }
            else{
                err = new Error('Item  not found');
                err.status = 404;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err))
    }
    
});

*/
module.exports = favoriteRouter;