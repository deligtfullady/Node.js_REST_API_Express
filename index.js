const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware: парсим JSON из тела запроса
app.use(express.json());

// Путь к файлу с пользователями
const USERS_FILE = path.join(__dirname, 'users.json');

// Вспомогательная функция: прочитать пользователей из файла
function readUsers() {
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  return JSON.parse(data);
}

// Вспомогательная функция: записать пользователей в файл
function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// Получить всех пользователей
app.get('/users', (req, res) => {
  try {
    const users = readUsers();
    res.json(users);
  } catch (err) {
    console.error('Ошибка чтения файла:', err.message);
    res.status(500).json({ error: 'Не удалось прочитать пользователей' });
  }
});

// Получить одного пользователя по ID
app.get('/users/:id', (req, res) => {
  try {
    const users = readUsers();
    const id = Number(req.params.id);
    const user = users.find(u => u.id === id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (err) {
    console.error('Ошибка чтения файла:', err.message);
    res.status(500).json({ error: 'Не удалось получить пользователя' });
  }
});

// Создать нового пользователя
app.post('/users', (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Поля name и email обязательны' });
    }

    const users = readUsers();

    // Генерируем новый ID (максимальный + 1)
    const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
    const newId = maxId + 1;

    const newUser = { id: newId, name, email };
    users.push(newUser);

    writeUsers(users);

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Ошибка при создании пользователя:', err.message);
    res.status(500).json({ error: 'Не удалось создать пользователя' });
  }
});

// Обновить пользователя по ID (полная замена или частичное обновление)
app.put('/users/:id', (req, res) => {
  try {
    const users = readUsers();
    const id = Number(req.params.id);
    const { name, email } = req.body;

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const existingUser = users[userIndex];

    // Обновляем только переданные поля
    if (name !== undefined) existingUser.name = name;
    if (email !== undefined) existingUser.email = email;

    users[userIndex] = existingUser;
    writeUsers(users);

    res.json(existingUser);
  } catch (err) {
    console.error('Ошибка при обновлении пользователя:', err.message);
    res.status(500).json({ error: 'Не удалось обновить пользователя' });
  }
});

// Удалить пользователя по ID
app.delete('/users/:id', (req, res) => {
  try {
    const users = readUsers();
    const id = Number(req.params.id);

    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const deletedUser = users.splice(userIndex, 1)[0];
    writeUsers(users);

    // По REST для DELETE часто возвращают 204 без тела, но можно вернуть и удалённого пользователя
    res.status(200).json(deletedUser);
  } catch (err) {
    console.error('Ошибка при удалении пользователя:', err.message);
    res.status(500).json({ error: 'Не удалось удалить пользователя' });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
