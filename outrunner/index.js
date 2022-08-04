'use strict';

import express from 'express';
const app = express();

app.set('port', (process.env.PORT || 8080));

app.use(express.static('.'));


app.listen(app.get('port'), function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('Running on port: ' + app.get('port'));
  }
});
