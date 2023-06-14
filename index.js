const express = require('express');
const { exec } = require('child_process');
const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/status', (req, res) => {
  res.sendStatus(200);
});

app.post('/reboot', (req, res) => {
  res.send('Rebooting server...');
  exec('sleep 1 && shutdown -r now', (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
    }
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
