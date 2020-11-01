const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const errorhandler = require('errorhandler');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));

const apiRouter = require('./api/api');
app.use('/api', apiRouter);


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;