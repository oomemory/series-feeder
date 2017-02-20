var js2xmlparser = require('js2xmlparser');

// generate valid RSS content
// -------------------------------------------------------------------------------
exports.generateXML = function(res, title, link, jsonData) {

	var dataXML = {
			title: title,
			link: link,
			description: "Series en español",
			language: "es-es",
			category: "Series",
			item: jsonData
	}

	// default RSS message when nothing new is published
	var rssContent = '<?xml version="1.0" encoding="UTF-8"?><channel><title>' +
										title +
										'</title><link>' +
										link +
										'</link><description>Series en español</description><language>es-es</language><category>Series</category></channel>';

	if ( dataXML.item.length > 0 ) {
		var options = {
		    useCDATA: true
		};

		rssContent = js2xmlparser.parse("channel", dataXML, options);
	}

	res.set('Content-Type', 'text/xml');
	res.set('Cache-Control', 'no-store');
	res.send( rssContent );
}
