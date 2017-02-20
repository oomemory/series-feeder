var cheerio = require('cheerio');

// tools
var dates = require('../tools/dates.js');
var xml = require('../tools/xml.js');


// scrape series page for todotorrents.com
// -------------------------------------------------------------------------------
exports.scrapeSeries = function(res, body) {
	var $ = cheerio.load(body);
	var scrappedData = [];

	$('.box').find('.fila').each(function(i, elem) {

			var date = $(this).children('.ver_date').text();
			date = dates.parseDate(date);

			var title = $(this).find('a.menu_link').text();
			var link = $(this).find('a.menu_link').attr('href');

			// scrapped links follow this pattern: /descargar/151978/
			// download links follow this pattern: /download.php?id=151978
			var pattern = /descargar\/(\d+)\//g;
			var torrentId = getMatches(link, pattern);
			link = 'http://todotorrents.com/download.php?id=' + torrentId;

			if (title) {
				var data = {
					title: title,
					link: link,
					pubDate: date
				};

				scrappedData.push(data);
			}
	});

	xml.generateXML(res, "Series todotorrents.com", "http://todotorrents.com/cat/5/", scrappedData);
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
