const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/ams_db'); 
const authRoutes = require('./routes/authRoutes');
const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
