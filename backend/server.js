const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

require('dotenv').config();

const db = require('./db');

app.use(express.json());
app.use(cors());

app.get('/', (req , res) => {
    res.json({message: 'welcome to server'})
});

app.post('/login' , (req ,res) => {
    const { username , password} = req.body;

    if(!username || !password) return res.status(400).json({message: "Missing fields"});

    db.query(
        'select * from users where username = ?', [username] , async (error, results) => {

            if (error) return res.status(500).json({ message: 'Database error' });
            if (results.length === 0) return res.status(401).json({ message: 'User not found' });

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            
            if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            
            res.json(
                { 
                    message: 'Login successful',
                    token,
                    user: {
                        username: user.username,
                        role: user.role,
                        user_id: user.user_id,
                        fullname: user.fullname,
                        email: user.email
                    } 
                });

        }
    )
})

app.get('/books' , (req, res) => {
    const query = `
      SELECT b.book_id, b.title, b.author, c.category_name, b.available, b.isbn, b.cover_image 
      FROM books b 
      JOIN categories c ON b.category_id = c.category_id
      ORDER BY b.book_id ASC;  
    `; // <-- เพิ่ม ORDER BY ตรงนี้

    db.query(query , (err , results) => { // <-- เปลี่ยนมาใช้ตัวแปร query
        if(err) return res.status(500).json({message: "Missing fields"})

        return res.status(200).json({ results});
    })
})

// CREATE a new book
app.post('/books', (req, res) => {
  const { title, author, category_id, quantity, isbn, description, cover_image } = req.body;

  // ตรวจสอบข้อมูลเบื้องต้น
  if (!title || !author || !category_id || !quantity || !isbn) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const query = `
    INSERT INTO books (title, author, category_id, total_quantity, available, isbn, description, cover_image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // ให้ total_quantity และ available มีค่าเท่ากับ quantity ที่ส่งมา
  const values = [title, author, category_id, quantity, quantity, isbn, description, cover_image];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error creating book:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    // ส่งข้อมูลหนังสือที่เพิ่งสร้างกลับไป (รวมถึง ID ใหม่)
    res.status(201).json({ message: 'Book created successfully', bookId: results.insertId });
  });
});

// DELETE a book by id
app.delete('/books/:id', (req, res) => {
  const bookId = req.params.id;

  if (!bookId) {
    return res.status(400).json({ message: "Missing book ID" });
  }

  // !!! สำคัญ: ต้องลบข้อมูลที่อ้างอิงใน borrow_requests ก่อน
  const deleteRequestsQuery = 'DELETE FROM borrow_requests WHERE book_id = ?';
  
  db.query(deleteRequestsQuery, [bookId], (err, results) => {
    if (err) {
      console.error('Error deleting borrow_requests:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    // หลังจากลบ borrow_requests แล้ว ก็ลบหนังสือ
    const deleteBookQuery = 'DELETE FROM books WHERE book_id = ?';
    db.query(deleteBookQuery, [bookId], (err, results) => {
      if (err) {
        console.error('Error deleting book:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: 'Book not found' });
      }

      res.status(200).json({ message: 'Book deleted successfully' });
    });
  });
});




app.listen(process.env.PORT , () => {
    console.log(`server is running on port  ${process.env.PORT}`);
})
