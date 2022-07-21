const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(req, res, next) {
  const {username} = req.headers

  const user = users.find(user=>user.username === username)

  if(!user){
    return res.status(404).json({error:"User not found"})
  }

  req.usernameExists = user

  return next();
}

app.post('/users', (req, res) => {
  const {name, username} = req.body

  const VerifyUser = users.some(e=> e.username === username)

  if(VerifyUser){
    return res.status(400).send({error:"user already exists"})
  }

  const user = {
    id:uuidv4(),
    name:name,
    username:username,
    todos:[]
  }

  users.push(user)

  return res.status(201).json(users)
});

app.get('/todos', checksExistsUserAccount, (req, res) => {
  const {usernameExists} = req

  return res.json(usernameExists.todos)
});

app.post('/todos', checksExistsUserAccount, (req, res) => {
  const {title, deadline} = req.body
  const {usernameExists} = req

  const TodoUser = {
    id:uuidv4(),
    title:title,
    done:false,
    deadline: new Date(deadline),
    created_at:new Date()
  }

  usernameExists.todos.push(TodoUser)

  return res.send(usernameExists)
});

app.put('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {usernameExists} = req
  const {title, deadline} = req.body

  const VerifyIdUser = usernameExists.todos.find(e=>e.id === id)
  
  if(!VerifyIdUser){
    return res.send("error!! TODO not Found")
  }

  VerifyIdUser.title = title;
  VerifyIdUser.deadline = new Date(deadline)
  
  console.log(VerifyIdUser)

  return res.status(200).send(VerifyIdUser)


});

app.patch('/todos/:id/done', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {usernameExists} = req

  const VerifyIdUser = usernameExists.todos.find(e=>e.id === id)

  if(!VerifyIdUser){
    return res.send("error!! TODO not Found")
  }
  
  VerifyIdUser.done = true;

  return res.status(200).send(VerifyIdUser)
});

app.delete('/todos/:id', checksExistsUserAccount, (req, res) => {
  const {id} = req.params;
  const {usernameExists} = req

  const VerifyIdTodo = usernameExists.todos.findIndex(e=>e.id === id)

  if(VerifyIdTodo === -1){
    return res.status(404).json({error: 'Mensagem do erro'})
  }

  usernameExists.todos.splice(VerifyIdTodo, 1)

  return res.status(204).send()
});

module.exports = app;