const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const campground = require('./models/campground');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
mongoose.connect('mongodb://localhost:27017/yelp-camp'); // db name

const db = mongoose.connection; // just to shorten code
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) // viewpath

app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/campgrounds', catchAsync(async(req, res) => {
    const campgrounds = await campground.find({});
    res.render('campgrounds/index', {campgrounds});
}));
// order matters
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', catchAsync(async (req, res) => {
    if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const camp = new campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);   
}))

app.get('/campgrounds/:id', catchAsync(async(req, res) => {
    const camp = await campground.findById(req.params.id);
    res.render('campgrounds/show', { camp });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const camp = await campground.findById(req.params.id);
    res.render('campgrounds/edit', {camp});
}))

app.put('/campgrounds/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    const camp = await campground.findByIdAndUpdate(id, {...req.body.camp }, {new: true});
    res.redirect(`/campgrounds/${camp._id}`);
}))
app.delete('/campgrounds/:id', catchAsync(async(req, res) => {
    const { id } = req.params;
    await campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// for all paths and callbacks that don't exist
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})
app.use((err, req, res, next) => {
    const {statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode);
    res.render('error', {err}) // can redirect
})

app.listen(3010, ()=> {
    console.log('Serving on port 3010');
});