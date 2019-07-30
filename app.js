const express = require("express");
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();

//Map global promise- get rid of warning
mongoose.Promise = global.Promise;
//Connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', { useNewUrlParser: true })
.then(()=> console.log('MongoDB connected....'))
.catch(err => console.log(err));

//Load Idea mongoose
require('./models/Idea');
const Idea = mongoose.model('ideas');

//Handlebar middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

//Bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Method override middleware
app.use(methodOverride('_method'));
 


//Index route
app.get('/', (req, res)=>{
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

//About Route
app.get('/about', (req, res)=>{
  res.render('about');
});

app.get('/ideas', (req, res) => {
  Idea.find({})
  .sort({date:'desc'})
  .then(ideas => {
    res.render('ideas/index', {
      ideas:ideas
    });
  });
 
});


//Add Idea form
app.get('/ideas/add', (req, res)=>{
  res.render('ideas/add');
});

app.get('/ideas/edit/:id', (req, res)=>{
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    res.render('ideas/edit',{
      idea:idea
    });
  }); 
});

app.post('/ideas', (req, res) => {
  let errors = [];

  if(!req.body.title){
    errors.push({text: 'Please enter title'});

  }
  if(!req.body.details){
    errors.push({text: 'Please enter details'});

  }
  
  if(errors.length > 0){
    res.render('ideas/add', {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    });
  }else{
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        res.redirect('/ideas');
      })
  }
});

//Edit fórm process
app.put('/ideas/:id', (req, res)=> {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    //new values
    idea.title = req.body.title;
    idea.details = req.body.title;

    idea.save()
      .then(idea => {
        res.redirect('/ideas');
      })
  });
});

//Delete ideas
app.delete('/ideas/:id', (req, res) => {
  Idea.remove({_id: req.params.id})
  .then(()=> {
    res.redirect('/ideas');
  });
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);

})