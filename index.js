var express = require('express');
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var json = require('jsonfile');
var js2xmlparser = require('js2xmlparser');

// server
var port = 8000;
var app = express();


// get index page (the page that has the links)
// -------------------------------------------------------------------------------
function readTorrentURL(res, torrentURL, callback) {
	request(torrentURL, function(err, resp, body) {
		if(err) {
 			console.log(err);
			server_response.sendStatus(500);
		} else {
	  	//bulkData = body;
			//eventEmitter.emit('endReadingBulkData');
			console.log('Torrent page ' + torrentURL + ' successfully read');
			callback(res, body);
		}
	});
}

// scrape index page to build array containing link and serie title
// -------------------------------------------------------------------------------
var scrapeForTorrents = function scrapeForTorrents(res, body) {
	var $ = cheerio.load(body);
	var scrappedData = [];

	$('.fichas-listado').find('tr').each(function(i, elem) {

			var fecha = $(this).children('.fecha').text();
			fecha = parseFecha(fecha);

			// iterates over all td class nombre
			var title = $(this).find('a.nombre').text();

			var link = $(this).find('.boton').attr('href');
			link = 'http://www.elitetorrent.net' + link;

			if (title) {
				var data = {
					title: title,
					link: link,
					pubDate: fecha
				};

				scrappedData.push(data);
			}
	});

	var dataXML = {
			"title": "Series elitetorrent.net",
			"link": "http://www.elitetorrent.net/categoria/4/series/modo:listado",
			"description": "Series en español",
			"language": "es-es",
			"category": "Series",
			"item": scrappedData
	}

	console.log('Page scrapped with ' + scrappedData.length.toString() + ' items');
	generateXML(res, dataXML);
}


// generate valid RSS content
// -------------------------------------------------------------------------------
var generateXML = function generateXML(res, dataXML) {

	var rssContent = 'No data';
	if ( dataXML.item.length > 0 ) {
		var options = {
		    useCDATA: true
		};

		rssContent = js2xmlparser.parse("channel", dataXML, options);
	}

	console.log('Res sent with RSS data');
	res.set('Content-Type', 'text/xml');
	res.send( rssContent );
}

// parse fecha
// -----------------------------------------------
var parseFecha = function parseFecha(fecha) {

	var fechaFinal;
  var hoyUTC = new Date();

	if ( (/hr/.test(fecha)) || (/hrs/.test(fecha)) ) {
		fechaFinal = hoyUTC.toJSON().slice(0,10);
	} else if (/días/.test(fecha)) {
		var pattern = /Hace\s(\d+)\sdías/g;
		var dias = getMatches(fecha, pattern);
		hoyUTC.setDate(hoyUTC.getDate() - dias[0]);
		fechaFinal = hoyUTC.toJSON().slice(0,10);

	} else if (/día/.test(fecha)) {
		hoyUTC.setDate(hoyUTC.getDate() - 1);
		fechaFinal = hoyUTC.toJSON().slice(0,10);

	} else {
		fechaFinal = 'Unknown';
	}

	return fechaFinal;
}

// get regex matches
// -----------------------------------------------
function getMatches(string, regex, index) {
  index || (index = 1); // default to the first capturing group
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    matches.push(match[index]);
  }
  return matches;
}



// -----------------------------------------------
// -----------------------------------------------

// GET route
app.get('/elitetorrent/series', function (req, res) {
	// trigger rss parser for elitetorrent
	// the callback will invoke res
//	server_response = res;
	readTorrentURL(res, 'http://www.elitetorrent.net/categoria/4/series/modo:listado', scrapeForTorrents);
});

// serter start up
app.listen(port, function () {
  console.log('Spanish torrent parser listening on port ' + port.toString());
});
