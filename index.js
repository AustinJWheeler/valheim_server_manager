const express = require('express');
const { exec } = require('child_process');
const app = express();

const parse_logs = (logs) => logs.split('\n').filter(x => x.slice(16, 41) === 'raptor start_my_server.sh').map(x => ({
  message: x.slice(69),
  date_time: new Date(Date.UTC(
    x.slice(54, 58),
    x.slice(48, 50) - 1,
    x.slice(51, 53),
    x.slice(59, 61),
    x.slice(62, 64),
    x.slice(65, 67),
  )),
  raw: x.slice(48),
})).reverse()

const getLogs = () => {
  const raw = execSync('journalctl -u cloud-config -n 200 --no-pager').toString()
  const all = parse_logs(raw)

  const players_online = all
    .filter(x => x.message.slice(0,13) === ' Connections ' && x.date_time > new Date((Date.now()) - 11 * 60 * 1000))
    .map(x => parseInt(x.message.slice(13, 15).trim()))
    .slice(0, 1)
    .reduce((a, b) => a + b, 0)

  const last = all
    .filter(x => x.message.slice(0,49) === 'Player joined server "Raptor" that has join code ')
    .slice(0, 1)

    console.log(last.length)

  const last_login = last.map(x => ((Date.now()) - x.date_time.getTime()) / (60 * 60 * 1000)).reduce((a, b) => a + b, 0)
  const join_code = last.map(x => x.message.slice(49, 55)).reduce((a, b) => a + b, "")

  return {
    all,
    players_online,
    last_login: last_login === 0 ? null : last_login,
    join_code
  }
}

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

app.get('/logs', (req, res) => {
  res.json(getLogs());
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
