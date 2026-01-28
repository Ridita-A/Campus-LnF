const express = require('express');
const cors = require('cors');
const lostRoutes = require('./routes/lostReportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/lost', lostRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));