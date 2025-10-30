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
                        user_id: user.user_id
                    } 
                });

        }
    )
})

app.get('/books' , (req, res) => {
    db.query('select b.book_id , b.title ,b.author, c.category_name , b.available , b.isbn from books b join categories c on b.category_id = c.category_id;' , (err , results) => {
        if(err) return res.status(500).json({message: "Missing fields"})

        return res.status(200).json({ results});
    })
})

app.listen(process.env.PORT , () => {
    console.log(`server is running on port ${process.env.PORT}`);
})
