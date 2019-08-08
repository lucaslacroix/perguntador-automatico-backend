const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/css', express.static(`${__dirname}/view/css`));
app.use('/js', express.static(`${__dirname}/view/js`));
app.use('/vendor', express.static(`${__dirname}/view/vendor`));
app.use('/img', express.static(`${__dirname}/view/img`));

app.use(require('./routes'));

app.listen(process.env.PORT || 3000); 