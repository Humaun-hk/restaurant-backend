const express = require('express');
const mysql = require('mysql');
const port = process.env.PORT || 5000;
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  })
);

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'sifat_dbms',
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Foods Routes

// Get all foods
app.get('/menu', (req, res) => {
  const sql = 'SELECT * FROM foods';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a single food item by ID
app.get('/menu/:id', (req, res) => {
  const sql = 'SELECT * FROM foods WHERE id = ?';
  db.query(sql, [req.params.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

// Add a new food item
app.post('/menu', (req, res) => {
  const sql = 'INSERT INTO foods (strMeal, strMealThumb, strCategory, price, details, made, strArea, orders) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  const { strMeal, strMealThumb, strCategory, price, details, made, strArea, orders } = req.body;
  db.query(sql, [strMeal, strMealThumb, strCategory, price, details, made, strArea, orders], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, message: 'Food item added successfully' });
  });
});

// Update a food item
app.patch('/menu/:id', (req, res) => {
  const sql = 'UPDATE foods SET strMeal = ?, strMealThumb = ?, strCategory = ?, price = ?, details = ?, made = ?, strArea = ?, orders = ? WHERE id = ?';
  const { strMeal, strMealThumb, strCategory, price, details, made, strArea, orders } = req.body;
  db.query(
    sql,
    [strMeal, strMealThumb, strCategory, price, details, made, strArea, orders, req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ message: 'Food item updated successfully' });
    }
  );
});

// Delete a food item
app.delete('/menu/:id', (req, res) => {
  const sql = 'DELETE FROM foods WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Food item deleted successfully' });
  });
});

// Users Routes

// Get all users
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new user
app.post('/users', (req, res) => {
  const sqlCheck = 'SELECT * FROM users WHERE email = ?';
  const sqlInsert = 'INSERT INTO users (email, name, role) VALUES (?, ?, ?)';
  const { email, name, role } = req.body;

  db.query(sqlCheck, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length > 0) {
      return res.json({ message: 'User already exists' });
    }

    db.query(sqlInsert, [email, name, role], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id: result.insertId, message: 'User added successfully' });
    });
  });
});

// Carts Routes

// Get cart items for a user
app.get('/carts', (req, res) => {
  const sql = 'SELECT carts.*, foods.strMeal, foods.price FROM carts JOIN foods ON carts.foodId = foods.id WHERE carts.userEmail = ?';
  const { email } = req.query;

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add an item to the cart
app.post('/carts', (req, res) => {
  const sql = 'INSERT INTO carts (userEmail, foodId, quantity) VALUES (?, ?, ?)';
  const { userEmail, foodId, quantity } = req.body;
  console.log(req.body);
  

  db.query(sql, [userEmail, foodId, quantity], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: result.insertId, message: 'Item added to cart' });
  });
});

// Delete an item from the cart
app.delete('/carts/:id', (req, res) => {
  const sql = 'DELETE FROM carts WHERE id = ?';
  db.query(sql, [req.params.id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Item removed from cart' });
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Craft Fusion Server Running');
});

// Start server
app.listen(port, () => {
  console.log('Server is listening on port:', port);
});
