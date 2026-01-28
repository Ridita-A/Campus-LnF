const express = require('express');
const cors = require('cors');
const lostRoutes = require('./routes/lostReportRoutes');
const foundRoutes = require('./routes/foundReportRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/lost', lostRoutes);
app.use('/api/found', foundRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));