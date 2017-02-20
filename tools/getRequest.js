var request = require('request');
var iconv  = require('iconv-lite');


// get page
// -------------------------------------------------------------------------------
// callbck >> scraper
// res >> response object for express
exports.getPage = function(res, url, callback) {
	request(url, function(err, resp, body) {
		if(err) {
 			console.log(err);
			res.sendStatus(500);
		} else {
			// start scraping with the corresponding scraper
			callback(res, body);
		}
	});
}

// get page for pages not using UTF8 encoding (old websites)
// -------------------------------------------------------------------------------
// callbck >> scraper
// res >> response object for express
exports.getPageISO8859 = function(res, url, callback) {

	var requestOptions  = { encoding: null, method: "GET", uri: url};
	request(requestOptions, function(err, resp, body) {
		if(err) {
 			console.log(err);
			res.sendStatus(500);
		} else {
			// character encoding conversion here
			var utf8Body = iconv.decode(new Buffer(body), "ISO-8859-1");
			// start scraping with the corresponding scraper
			callback(res, utf8Body);
		}
	});
}
