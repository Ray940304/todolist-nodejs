const http = require('http');
const { v4: uuidv4 } = require('uuid');
const headers = require('./header');
const errorHandle = require('./errorHandle');

const todos = [];

const requestListener = (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', () => {
    handleRoute(req, res, body);
  });
};

const handleRoute = (req, res, body) => {
  const { url, method } = req;

  if (url === '/todos' && method === 'GET') {
    getTodos(res);
  } else if (url === '/todos' && method === 'POST') {
    addTodo(res, body);
  } else if (url === '/todos' && method === 'DELETE') {
    deleteAllTodos(res);
  } else if (url.startsWith('/todos/') && method === 'DELETE') {
    const id = url.split('/').pop();
    deleteTodoById(res, id);
  } else if (url.startsWith('/todos/') && method === 'PATCH') {
    const id = url.split('/').pop();
    updateTodoById(res, body, id);
  } else if (method === 'OPTIONS') {
    res.end();
  } else {
    notFound(res);
  }
};

const getTodos = (res) => {
  res.writeHead(200, headers);
  res.write(JSON.stringify({ status: 'success', data: todos }));
  res.end();
};

const addTodo = (res, body) => {
  try {
    const { title } = JSON.parse(body);
    if (!title) throw new Error('Title is missing');
    const todo = { title, id: uuidv4() };
    todos.push(todo);
    res.writeHead(200, headers);
    res.write(JSON.stringify({ status: 'success', data: todos }));
    res.end();
  } catch (e) {
    errorHandle(res);
  }
};

const deleteAllTodos = (res) => {
  todos.length = 0;
  res.writeHead(200, headers);
  res.write(JSON.stringify({ status: 'success', data: todos }));
  res.end();
};

const deleteTodoById = (res, id) => {
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return errorHandle(res);

  todos.splice(index, 1);
  res.writeHead(200, headers);
  res.write(JSON.stringify({ status: 'success', data: todos }));
  res.end();
};

const updateTodoById = (res, body, id) => {
  try {
    const { title } = JSON.parse(body);
    if (!title) throw new Error('Title is missing');
    const index = todos.findIndex((todo) => todo.id === id);
    if (index === -1) throw new Error('Todo not found');

    todos[index].title = title;
    res.writeHead(200, headers);
    res.write(JSON.stringify({ status: 'success', data: todos }));
    res.end();
  } catch (e) {
    errorHandle(res);
  }
};

const notFound = (res) => {
  res.writeHead(404, headers);
  res.write(JSON.stringify({ status: 'false', message: '無此網站路由' }));
  res.end();
};

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);
