const express = require('express');
const bodyParser = require('body-parser');
const cors = require('./cors');
const Items = require('../models/items');
const authenticate = require('../authenticate');

const itemRouter = express.Router();
itemRouter.use(bodyParser.json());

itemRouter.route('/')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors, (req,res,next) => {
    Items.find(req.query).populate('comments.author')
    .then((items) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(items);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next) => {
    Items.create(req.body)
    .then((item) => {
        console.log('item created', item);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(item);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /items');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next) => {
    Items.remove({})
    .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});

itemRouter.route('/:itemId')
.options(cors.corsWithOptions, (req,res) => { res.sendStatus(200); })
.get(cors.cors,(req,res,next) => {
    Items.findById(req.params.itemId)
    .populate('comments.author')
    .then((item) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(item);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /items' + req.params.itemId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Items.findByIdAndUpdate(req.params.itemId,{
        $set : req.body
    }, { new: true } )
    .then((item) => {
        console.log('item updated !');
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(item);
    }, (err) => next(err))
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin , (req,res,next) => {
   Items.findByIdAndRemove(req.params.itemId)
   .then((resp) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    }, (err) => next(err))
    .catch((err) => next(err));
});


module.exports = itemRouter;