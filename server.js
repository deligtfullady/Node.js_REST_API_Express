const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'users.json');

// Загрузка пользователей
function loadUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Ошибка чтения users.json:', err);
  }
  return [];
}

// Сохранение пользователей
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// GET /users — получить всех пользователей
app.get('/users', (req, res) => {
  const users = loadUsers();
  res.json(users);
});

// GET /users/:id — получить одного пользователя
app.get('/users/:id', (req, res) => {
  const users = loadUsers();
  const user = users.find(u => u.id === Number(req.params.id));

  if (!user) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }
  res.json(user);
});

// POST /users — создать пользователя
app.post('/users', (req, res) => {
  const users = loadUsers();
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Нужны name и email' });
  }

  const newUser = {
    id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
    name,
    email
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json(newUser);
});

// PUT /users/:id — обновить пользователя
app.put('/users/:id', (req, res) => {
  const users = loadUsers();
  const index = users.findIndex(u => u.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const { name, email } = req.body;
  users[index] = {
    ...users[index],
    name: name || users[index].name,
    email: email || users[index].email
  };

  saveUsers(users);
  res.json(users[index]);
});

// DELETE /users/:id — удалить пользователя
app.delete('/users/:id', (req, res) => {
  let users = loadUsers();
  const index = users.findIndex(u => u.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ message: 'Пользователь не найден' });
  }

  const deletedUser = users.splice(index, 1)[0];
  saveUsers(users);

  res.json({ message: 'Пользователь удалён', user: deletedUser });
});

app.listen(3000, () => {
  console.log('REST API запущен на http://localhost:3000');
});
