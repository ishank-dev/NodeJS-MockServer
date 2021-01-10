const api = require('./routes/api');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', api);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));