require('dotenv').config();
const express = require('express');
const weatherRoutes = require('./routes/weather');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/api', weatherRoutes);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});
