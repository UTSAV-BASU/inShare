const express = require('express');
const path = require('path');

const app = express();
const connectDB = require('./config/db');
connectDB();
// to instruct the server that that our public data files like css files are kept in public folder
app.use(express.static('public'))
app.use(express.json());
//for using template engine
app.set('views',path.join(__dirname,'/views'));
app.set('view engine','ejs');
//ROUTES
app.use('/api/files',require('./routes/files'));


app.use('/files',require('./routes/show'));

app.use('/files/download',require('./routes/download'));


const PORT  = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(`Listening on port ${PORT}`);
});