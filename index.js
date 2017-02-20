var express = require('express');
var path = require('path');
var fs = require('fs');

// logger module
var morgan = require('morgan');

// scrapers
var elitetorrent = require('./scrapers/elitetorrent.js');
var todotorrents = require('./scrapers/todotorrents.js');
var mejortorrent = require('./scrapers/mejortorrent.js');

// tools
var getter = require('./tools/getRequest.js');

// server
var port = 8000;
var app = express();



// -----------------------------------------------
// log output handling very very simple and dirty
app.use(morgan('combined'));
var access = fs.createWriteStream('./logs/access.log');
process.stdout.write = access.write.bind(access);

// GET route elitetorrent/series
app.get('/elitetorrent/series', function (req, res) {
	// trigger rss parser for elitetorrent
	getter.getPage(res, 'http://www.elitetorrent.net/categoria/4/series/modo:listado', elitetorrent.scrapeSeries);
});

// GET route todotorrents/series
app.get('/todotorrents/series', function (req, res) {
	// trigger rss parser for elitetorrent
	getter.getPage(res, 'http://todotorrents.com/cat/5/', todotorrents.scrapeSeries);
});

// GET route mejortorrent/series
app.get('/mejortorrent/series', function (req, res) {
	// trigger rss parser for elitetorrent
	getter.getPageISO8859(res, 'http://www.mejortorrent.com/torrents-de-series-hd-alta-definicion.html', mejortorrent.scrapeSeries);
});

// default route to 404 error
app.get('/*', function (req, res) {
  res.sendStatus(404);
})

// server start up
app.listen(port, function () {
	var nowDate = new Date();
  console.log('Spanish torrent parser listening on port ' + port.toString() + ' at ' + nowDate.toString());
});
