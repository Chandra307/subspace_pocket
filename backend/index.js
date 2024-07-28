const express = require('express');
const cors = require('cors');
const userRouter = require('./src/routes/user');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/user', userRouter);

app.use((req, res, next) => {
    let fileName;
    
    if (req.url === '/' || req.url === '/login.html') fileName = '/login.html'
    else fileName = req.url;
    
    let filePath =  path.join(__dirname, '../', '/frontend', fileName);
    res.sendFile(filePath);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
