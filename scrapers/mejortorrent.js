var cheerio = require('cheerio');

// tools
var dates = require('../tools/dates.js');
var xml = require('../tools/xml.js');
var getter = require('../tools/getRequest.js');


// scrape series page for mejortorrent.com
// -------------------------------------------------------------------------------
exports.scrapeSeries = function(res, body) {
	var $ = cheerio.load(body);
	var scrappedData = [];

	$('table[width=440]').each(function(i, elem) {

			var pubDate = '';
			var titles = [];
			var links = [];

			$(this).find('tr').each(function(i, elem) {

				if (i == 1) {
					var date = $(this).find('span').text();
					pubDate = dates.parseDateLongFormat(date);

				} else if (i == 2) {
					// links
					$(this).find('center').remove();
					$(this).find('div a').each(function(i, elem) {
						var link = 'http://www.mejortorrent.com' + $(this).attr('href');
						var title = $(this).text().replace(/\r\n/,'');
						links.push(link);
						titles.push(title);
					});
				}
			});

			// build object storing scraped data
			for (var i = 0; i < links.length; i++) {
				var data = {
					title: titles[i],
					link: links[i],
					pubDate: pubDate
				};
				scrappedData.push(data);
			}
	});

	// loop through each scrapped item, request the page (one page for each TV serie), scrape torrent URL
	setTimeout(function () {
		iterateOverListOfPages(res, scrappedData, scrapeSeriesSeasonMejorTorrent, endScrapingSeriesSeasonMejorTorrent);
	}, 2000);

}



// asynchronous iteration pattern
// -------------------------------------------------------------------------------
function iterateOverListOfPages(res, list, task, callback) {
    // list is the collections of item we want to iterate over
    // task is a function representing the job to be done on each item
    // callback is the function we want to call when all iterations are over

    var doneCount = 0;  // here we'll keep track of how many reports we've got
		var seriesData = [];

    function report(serie) {
			// collect scrapped data only if valid data
			// serie is an array of data objects, each data object has a title, link and pubDate
			if (serie.length > 0) {
				for (var i = 0; i < serie.length; i++) {
					seriesData.push(serie[i]);
				}
			}

      // given to each call of the iterator so it can report its completion
      doneCount++;

      // if doneCount equals the number of items in list, then we're done
      if(doneCount === list.length)
        callback(res, seriesData);
    }

		// check if there are elements to iterate on, if not, kick of callback
		if (list.length === 0) {
			callback(res, seriesData);
		} else {
	    // here we give each iteration its job
	    for(var i = 0; i < list.length; i++) {
        task(res, list[i], report)
	    }
		}
}

// scrape pages for seasons of series
// -------------------------------------------------------------------------------
var scrapeSeriesSeasonMejorTorrent = function scrapeSeriesSeasonMejorTorrent(res, pageInfo, callback) {
	// if date is not today, do not scarpe
	var todayUTC = new Date();

	// ------------------------------------------
	// choose a different date than todate, for testing purposes
//	todayUTC.setDate(todayUTC.getDate() - 3);
	// ------------------------------------------

	// the day before today is needed because some episodes are added the day before they appear in the index
	var yesterday = new Date()
	yesterday.setDate(todayUTC.getDate() - 1);

	var stringDate = todayUTC.toJSON().slice(5,10);
	var stringDateYesterday = yesterday.toJSON().slice(5,10);

	// single container for scrapped data
	var data = {
		title: pageInfo.title,
		link: pageInfo.link,
		pubDate: pageInfo.pubDate
	};

	// container array for all scrapped data
	var scrappedData = [];

	// get only de series published today!
	if ( pageInfo.pubDate == stringDate ) {
		console.log('GET serie ' + pageInfo.link);
		getter.getPageISO8859(res, pageInfo.link, function(res, body) {
			// scraping page...
			var $ = cheerio.load(body);

			// row index
			var index = 0;

			// containers
			var links = [];
			var dates = [];

			// loop through the rows
			$('td[bgcolor=#C8DAC8]').each(function(i, elem) {
				if(i == (1 + index)) {
					links.push( $(this).find('a').attr('href') );
				} else if (i == (2 + index)) {
					dates.push( $(this).find('div').text() );
					index = index + 3;
				}
			});

			// build object storing scraped data
			for (var i = 0; i < links.length; i++) {
				var finalDate = dates[i].slice(12,17);
				var finalDateLong = dates[i].slice(7,17)
				var finalLink = 'http://www.mejortorrent.com' + links[i];
				var data = {
					title: pageInfo.title,
					link: finalLink,
					pubDate: finalDateLong
				};

				// add only de items published today or the day before!
				if ((finalDate == stringDate) || (finalDate == stringDateYesterday)) {
					scrappedData.push(data);
				}
			}

			// callback
			callback(scrappedData);
		});

	} else {
		callback(scrappedData);
	}
}

// callback after scrapping all pages of seasons
// -------------------------------------------------------------------------------
var endScrapingSeriesSeasonMejorTorrent = function endScrapingSeriesSeasonMejorTorrent(res, seriesData) {
	// now scrape all single torrent pages to grab the torrent link
	// loop through each scrapped item, request the page (one page for each TV episode), scrape torrent
	setTimeout(function () {
		iterateOverListOfPages(res, seriesData, scrapeSeriesEpisodeMejorTorrent, endScrapingSeriesEpisodeMejorTorrent);
	}, 2000);

}


// scrape pages for seasons of series
// -------------------------------------------------------------------------------
var scrapeSeriesEpisodeMejorTorrent = function scrapeSeriesEpisodeMejorTorrent(res, pageInfo, callback) {

	console.log('GET episode ' + pageInfo.link);
	getter.getPageISO8859(res, pageInfo.link, function(res, body) {
		// scraping page...
		var $ = cheerio.load(body);

		var link;
		var title;

		$('table[width=440]').find('a').each(function(i, elem) {
			if(i == 0) {
				title = $(this).text();
			} else if (i == 1) {
				link = 'http://www.mejortorrent.com/' + $(this).attr('href');
			}
		});

		$('table[width=440]').find('b').each(function(i, elem) {
			if(i == 3) {
				var episode = $(this).text();
				title = title + ' ' + episode;
				title = title.replace(/[\n\t]/g,'');
				title = title.replace(/\s\-\s\d+ª\sTemporada\s/,'');
				title = title.replace(/\s\-\s\d+º\sTemporada\s/,'');
				title = title.replace(/\s\-$/,'');
			}
		});

		// build object storing scraped data
		var data = {
			title: title,
			link: link,
			pubDate: pageInfo.pubDate
		};

		var scrappedData = [];
		scrappedData.push(data);

		// callback
		callback(scrappedData);
	});
}

// callback after scrapping all pages of seasons
// -------------------------------------------------------------------------------
var endScrapingSeriesEpisodeMejorTorrent = function endScrapingSeriesEpisodeMejorTorrent(res, episodesData) {
	// now scrape the torrent link
	// loop through each scrapped item, request the page (one page for each TV episode), scrape torrent
	setTimeout(function () {
		iterateOverListOfPages(res, episodesData, scrapeSeriesTorrentFileMejorTorrent, endScrapingSeriesTorrentFileMejorTorrent);
	}, 2000);

}


// scrape pages for seasons of series
// -------------------------------------------------------------------------------
var scrapeSeriesTorrentFileMejorTorrent = function scrapeSeriesTorrentFileMejorTorrent(res, pageInfo, callback) {

	console.log('GET torrent file ' + pageInfo.link);
	getter.getPageISO8859(res, pageInfo.link, function(res, body) {
		// scraping page...
		var $ = cheerio.load(body);
		var link = 'http://www.mejortorrent.com' + $('table[bgcolor=#E4E4E4]').find('a').attr('href');

		// build object storing scraped data
		var data = {
			title: pageInfo.title,
			link: link,
			pubDate: pageInfo.pubDate
		};

		var scrappedData = [];
		scrappedData.push(data);

		// callback
		callback(scrappedData);
	});
}

// callback after scrapping all pages of seasons
// -------------------------------------------------------------------------------
var endScrapingSeriesTorrentFileMejorTorrent = function endScrapingSeriesTorrentFileMejorTorrent(res, torrentFilesData) {
	xml.generateXML(res, "Series mejortorrent.com", "http://www.mejortorrent.com/torrents-de-series-hd-alta-definicion.html", torrentFilesData);
}
