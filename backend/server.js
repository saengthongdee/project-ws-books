const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();

require('dotenv').config();
const db = require('./db');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'welcome to server' })
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).json({ message: "Missing fields" });

  db.query(
    'select * from users where username = ?', [username], async (error, results) => {

      if (error) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(401).json({ message: 'User not found' });

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({
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
});

app.post('/changepassword', async (req, res) => {
  const { oldPassword, newPassword, username } = req.body;
  console.log(oldPassword);
  console.log(newPassword);
  console.log(username);
  if (!oldPassword || !newPassword || !username)
    return res.status(400).json({ message: 'Missing fields' });

  try {
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(404).json({ message: 'User not found' });

      const user = results[0];

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return res.status(401).json({ success: false, message: 'รหัสผ่านเก่าไม่ถูกต้อง' });

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      db.query(
        'UPDATE users SET password = ? WHERE username = ?',
        [hashedPassword, username],
        (err2, result) => {
          if (err2) return res.status(500).json({ message: 'Database update error' });

          return res.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ เรากำลังจะพาคุณไปหน้าหลัก' });
        }
      );
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.get('/books', (req, res) => {
  const query = `
      SELECT b.book_id, b.title, b.author, c.category_name, b.available, b.isbn, b.cover_image 
      FROM books b 
      JOIN categories c ON b.category_id = c.category_id
      ORDER BY b.book_id ASC;  
    `; // <-- เพิ่ม ORDER BY ตรงนี้

  db.query(query, (err, results) => { // <-- เปลี่ยนมาใช้ตัวแปร query
    if (err) return res.status(500).json({ message: "Missing fields" })

    return res.status(200).json({ results });
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

  // --- 1. ตรวจสอบสถานะหนังสือก่อน ---
  const checkQuery = 'SELECT available, total_quantity FROM books WHERE book_id = ?';

  db.query(checkQuery, [bookId], (err, results) => {
    if (err) {
      console.error('Error checking book status:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = results[0];

    // --- 2. ใช้เงื่อนไขใหม่: ถ้าหนังสือถูกยืม (available < total_quantity) ---
    if (book.available < book.total_quantity) {
      return res.status(400).json({ message: 'Cannot delete book: Book is currently on loan.' });
    }

    // --- 3. ถ้าไม่ถูกยืม (available == total_quantity) ก็ให้ลบได้ตามปกติ ---
    // (ลบจาก borrow_requests ก่อน เพื่อป้องกัน Foreign Key constraint)
    const deleteRequestsQuery = 'DELETE FROM borrow_requests WHERE book_id = ?';

    db.query(deleteRequestsQuery, [bookId], (err, requestResults) => {
      if (err) {
        console.error('Error deleting borrow_requests:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      // หลังจากลบ borrow_requests แล้ว ก็ลบหนังสือ
      const deleteBookQuery = 'DELETE FROM books WHERE book_id = ?';
      db.query(deleteBookQuery, [bookId], (err, bookResults) => {
        if (err) {
          console.error('Error deleting book:', err);
          return res.status(500).json({ message: 'Database error', error: err });
        }

        if (bookResults.affectedRows === 0) {
          // ส่วนนี้ไม่น่าจะเกิดขึ้นเพราะเราเช็คแล้ว แต่ใส่ไว้กันเหนียว
          return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ message: 'Book deleted successfully' });
      });
    });
  });
});
// ==========================================================
// ## ⬆️ สิ้นสุดส่วนที่แก้ไข ⬆️ ##
// ==========================================================

// ==========================================================
// ## ⬇️ ส่วนจัดการคำขอยืม (ที่สำคัญ) ⬇️ ##
// ==========================================================

// 1. GET: ดึงข้อมูลคำร้องขอยืม *ทั้งหมด* (สำหรับหน้า Dashboard home.jsx)
app.get('/borrow-requests/all', (req, res) => {

  // ⬇️ FIX: เพิ่ม , br.request_id DESC เข้าไปใน ORDER BY ⬇️
  const query = "SELECT br.request_id, br.user_id, br.book_id, br.request_date, br.approve_date, br.due_date, br.return_date, br.status, b.title, c.category_name FROM borrow_requests br JOIN books b ON br.book_id = b.book_id JOIN categories c ON b.category_id = c.category_id ORDER BY br.request_date DESC, br.request_id DESC;";

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all requests:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json(results);
  });
});

// 2. GET: ดึงข้อมูลคำร้องขอยืมเฉพาะที่ 'pending' (สำหรับหน้า approve.jsx)
app.get('/borrow-requests/pending', (req, res) => {

  // ⬇️ แก้ไขตรงนี้: รวมทุกอย่างไว้ในบรรทัดเดียว ⬇️
  const query = "SELECT request_id, user_id, book_id, request_date, status FROM borrow_requests WHERE status = 'pending' ORDER BY request_date ASC;";

  db.query(query, (err, results) => {
    if (err) {
      // (เราจะยังเก็บ console.error ไว้ดูเผื่อมีปัญหาอื่น)
      console.error('Error fetching pending requests:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    // ** ส่วนสำคัญ: ถ้า query สำเร็จ แต่ไม่มีข้อมูล 'pending'
    // ** มันจะส่ง Array ว่าง [] กลับไป ซึ่งถูกต้อง
    res.status(200).json(results);
  });
});

// ==========================================================
// ## ⬇️ (เพิ่มใหม่) GET: ดึงข้อมูลเฉพาะที่ 'approved' (สำหรับหน้า returnbook.jsx) ⬇️ ##
// ==========================================================
app.get('/borrow-requests/approved', (req, res) => {

  // เราจะดึงเฉพาะ field ที่หน้านี้ต้องใช้ และดึงเฉพาะ status = 'approved'
  const query = "SELECT br.request_id, br.user_id, br.book_id, br.approve_date, br.due_date FROM borrow_requests br WHERE br.status = 'approved' ORDER BY br.approve_date DESC, br.request_id DESC;";

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching approved requests:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }
    res.status(200).json(results);
  });
});
// ==========================================================
// ## ⬆️ สิ้นสุดส่วนที่เพิ่มใหม่ ⬆️ ##
// ==========================================================

// 3. PATCH: อัปเดตสถานะคำขอยืม (Approve / Reject / Return)
app.patch('/borrow-requests/:id', (req, res) => {
  const { id: requestId } = req.params;
  const { action, book_id } = req.body;

  if (action === 'approve') {
    // --- Logic การอนุมัติ ---
    db.beginTransaction(err => {
      if (err) {
        console.error('Transaction Error:', err);
        return res.status(500).json({ message: 'Database transaction error' });
      }

      db.query('SELECT available FROM books WHERE book_id = ? FOR UPDATE', [book_id], (err, results) => {
        if (err) {
          return db.rollback(() => {
            console.error('Check book Error:', err);
            res.status(500).json({ message: 'Database error checking book' });
          });
        }

        if (results.length === 0 || results[0].available <= 0) {
          return db.rollback(() => {
            res.status(400).json({ message: 'Book is not available for loan.' });
          });
        }

        db.query('UPDATE books SET available = available - 1 WHERE book_id = ?', [book_id], (err, updateBookResult) => {
          if (err) {
            return db.rollback(() => {
              console.error('Update book Error:', err);
              res.status(500).json({ message: 'Database error updating book' });
            });
          }

          // ⬇️ FIX: แก้ไข Query นี้ให้เป็นบรรทัดเดียว ⬇️
          const approveQuery = "UPDATE borrow_requests SET status = 'approved', approve_date = NOW(), due_date = DATE_ADD(NOW(), INTERVAL 7 DAY) WHERE request_id = ?";

          db.query(approveQuery, [requestId], (err, updateRequestResult) => {
            if (err) {
              return db.rollback(() => {
                // ⬇️ เรายังคงเก็บ console.error นี้ไว้ เผื่อมี Error อื่น ⬇️
                console.error('Update request Error:', err);
                res.status(500).json({ message: 'Database error updating request' });
              });
            }

            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  console.error('Commit Error:', err);
                  res.status(500).json({ message: 'Database commit error' });
                });
              }
              res.status(200).json({ message: 'Request approved successfully' });
            });
          });
        });
      });
    });

  } else if (action === 'reject') {
    // --- Logic การยกเลิก ---

    // ⬇️ FIX: แก้ไข Query นี้ให้เป็นบรรทัดเดียว ⬇️
    const rejectQuery = "UPDATE borrow_requests SET status = 'rejected', approve_date = NOW() WHERE request_id = ?";

    db.query(rejectQuery, [requestId], (err, results) => {
      if (err) {
        console.error('Reject Error:', err);
        return res.status(500).json({ message: 'Database error rejecting request' });
      }
      res.status(200).json({ message: 'Request rejected successfully' });
    });

  } else if (action === 'return') {
    // --- Logic การคืนหนังสือ ---
    if (!book_id) {
      return res.status(400).json({ message: 'Missing book_id for return action' });
    }

    db.beginTransaction(err => {
      if (err) {
        console.error('Return Transaction Error:', err);
        return res.status(500).json({ message: 'Database transaction error' });
      }

      // ⬇️ FIX: แก้ไข Query นี้ให้เป็นบรรทัดเดียว (และลบ ; ที่อยู่ข้างในออก) ⬇️
      const updateRequestQuery = "UPDATE borrow_requests SET status = CASE WHEN NOW() > due_date THEN 'returned_late' ELSE 'returned' END, return_date = NOW() WHERE request_id = ? AND status = 'approved'";

      db.query(updateRequestQuery, [requestId], (err, updateRequestResult) => {
        if (err) {
          return db.rollback(() => {
            console.error('Update request (return) Error:', err);
            res.status(500).json({ message: 'Database error updating request' });
          });
        }

        if (updateRequestResult.affectedRows === 0) {
          return db.rollback(() => {
            res.status(404).json({ message: 'Request not found or not in approved state' });
          });
        }

        const updateBookQuery = 'UPDATE books SET available = available + 1 WHERE book_id = ?';

        db.query(updateBookQuery, [book_id], (err, updateBookResult) => {
          if (err) {
            return db.rollback(() => {
              console.error('Update book (restock) Error:', err);
              res.status(500).json({ message: 'Database error restocking book' });
            });
          }

          db.commit(err => {
            if (err) {
              return db.rollback(() => {
                console.error('Return Commit Error:', err);
                res.status(500).json({ message: 'Database commit error' });
              });
            }
            res.status(200).json({ message: 'Book returned successfully' });
          });
        });
      });
    });

  } else {
    res.status(400).json({ message: 'Invalid action' });
  }
});

app.get('/books/:id', (req, res) => {
  const { id } = req.params;

  const sql = `
        SELECT b.book_id, b.title, b.author, b.isbn,
                b.cover_image, b.description,
                b.total_quantity, b.available,
                c.category_name
        FROM books b
        LEFT JOIN categories c ON b.category_id = c.category_id
        WHERE b.book_id = ?;
    `;

  db.query(sql, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });

    return res.status(200).json({ result: rows[0] });
  });
});

// USER REQUEST BOOK
app.post('/borrow-requests', (req, res) => {
  const { book_id, user_id } = req.body;

  if (!book_id || !user_id) {
    return res.status(400).json({ message: "Missing book_id or user_id" });
  }

  const checkLimitQuery = "SELECT COUNT(*) as activeBorrows FROM borrow_requests WHERE user_id = ? AND status IN ('pending', 'approved')";

  db.query(checkLimitQuery, [user_id], (err, limitResults) => {
    if (err) {
      console.error('Error checking borrow limit:', err);
      return res.status(500).json({ message: 'Database error' });
    }

    const activeBorrows = limitResults[0].activeBorrows;
    if (activeBorrows >= 3) {
      return res.status(409).json({
        message: 'ไม่สามารถยืมได้: คุณมีหนังสือที่ยืมค้างอยู่ 3 เล่ม (โควต้าเต็ม)'
      });
    }

    const checkDuplicateQuery =
      "SELECT request_id FROM borrow_requests WHERE user_id = ? AND book_id = ? AND status IN ('pending', 'approved')";

    db.query(checkDuplicateQuery, [user_id, book_id], (err, duplicateResults) => {
      if (err) {
        console.error('Error checking duplicates:', err);
        return res.status(500).json({ message: 'Database error' });
      }

      if (duplicateResults.length > 0) {
        return res.status(409).json({ message: 'คุณได้ส่งคำขอยืม หรือยืมหนังสือเล่มนี้อยู่แล้ว' });
      }

      const checkBookQuery = 'SELECT available FROM books WHERE book_id = ?';

      db.query(checkBookQuery, [book_id], (err, bookResults) => {
        if (err) {
          console.error('Error checking book availability:', err);
          return res.status(500).json({ message: 'Database error' });
        }

        if (bookResults.length === 0) {
          return res.status(404).json({ message: 'Book not found' });
        }

        if (bookResults[0].available <= 0) {
          return res.status(400).json({ message: 'หนังสือเล่มนี้ถูกยืมไปก่อนแล้ว' });
        }

        const insertQuery = `
                  INSERT INTO borrow_requests (user_id, book_id, request_date, status)
                  VALUES (?, ?, NOW(), 'pending')
              `;

        db.query(insertQuery, [user_id, book_id], (err, insertResult) => {
          if (err) {
            console.error('Error creating borrow request:', err);
            return res.status(500).json({ message: 'Database error creating request' });
          }

          res.status(201).json({
            message: 'ส่งคำขอยืมสำเร็จ! รอดำเนินการ',
            requestId: insertResult.insertId
          });
        });
      });
    });
  });
});

app.get('/borrow-history/:userId', (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const query = `
    SELECT 
      br.request_id, 
      br.user_id, 
      br.book_id, 
      br.request_date, 
      br.approve_date, 
      br.due_date, 
      br.return_date, 
      br.status, 
      b.title AS book_title,
      c.category_name AS category_name 
    FROM 
      borrow_requests br
    JOIN 
      books b ON br.book_id = b.book_id
    JOIN 
      categories c ON b.category_id = c.category_id
    WHERE 
      br.user_id = ?                   
    ORDER BY 
      br.request_date DESC, br.request_id DESC;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(`Error fetching history for user ${userId}:`, err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    res.status(200).json(results);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
