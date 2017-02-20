var cheerio = require('cheerio');

// tools
var dates = require('../tools/dates.js');
var xml = require('../tools/xml.js');

// scrape series page for elitetorrent.net
// -------------------------------------------------------------------------------
exports.scrapeSeries = function(res, body) {
	var $ = cheerio.load(body);
	var scrappedData = [];

	$('.fichas-listado').find('tr').each(function(i, elem) {

			var date = $(this).children('.fecha').text();
			date = dates.parseDate(date);

			// iterates over all td class nombre
			var title = $(this).find('a.nombre').text();

			var link = $(this).find('.boton').attr('href');
			link = 'http://www.elitetorrent.net' + link;

			if (title) {
				var data = {
					title: title,
					link: link,
					pubDate: date
				};

				scrappedData.push(data);
			}
	});

	xml.generateXML(res, "Series elitetorrent.net", "http://www.elitetorrent.net/categoria/4/series/modo:listado", scrappedData);
}
