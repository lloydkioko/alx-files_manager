const express = require('express');
const indexRoutes = require('./routes/index');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/', indexRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
