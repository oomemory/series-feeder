
// this parses dates of form: hace 8 hrs, hace 2 días, ...
// -----------------------------------------------
exports.parseDate = function(date) {

	var finalDate;
  var todayUTC = new Date();

	if ( (/hr/.test(date)) || (/hrs/.test(date)) || /horas/.test(date) || /hora/.test(date)) {
		finalDate = todayUTC.toJSON().slice(0,10);

	} else if (/días/.test(date) || /dias/.test(date)) {
		var pattern = /(\d+)\sd[íi]as/g;
		var days = getMatches(date, pattern);
		todayUTC.setDate(todayUTC.getDate() - days[0]);
		finalDate = todayUTC.toJSON().slice(0,10);

	} else if (/día/.test(date) || /dia/.test(date)) {
		todayUTC.setDate(todayUTC.getDate() - 1);
		finalDate = todayUTC.toJSON().slice(0,10);

	} else {
		finalDate = 'Unknown';
	}

	return finalDate;
}


// this parses dates of form: Jueves, 09 febrero a las 11:39:02
// output will be only mm-dd (without year, which is unknown)
// -----------------------------------------------
exports.parseDateLongFormat = function(date) {

	var monthNames = [ ' enero ', ' febrero ', ' marzo ', ' abril ', ' mayo ', ' junio ', ' julio ', ' agosto ', ' septiembre ', ' octubre ', ' noviembre ', ' diciembre ' ];

	var start = date.indexOf(",") + 2;
	var end = date.indexOf("a las");
	var pubDateDayMonth = date.substring(start, end);

	// replace month name with number
	var pubDate_ddmm = '';
	for (var i = 0; i < monthNames.length; i++) {

		var monthRegex = new RegExp( monthNames[i], "g");

		if (monthRegex.test(pubDateDayMonth)) {
			var month = i+1;
			var monthString = month.toString();
			if (month < 10) {
				monthString =	'0' + monthString;
			}

			var dayOnly = pubDateDayMonth.replace( monthNames[i], '');
			pubDate_ddmm = monthString + '-' + dayOnly;
		}
	}

	return pubDate_ddmm;
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
