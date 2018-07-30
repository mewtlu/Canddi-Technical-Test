module.exports = function (knwlInstance) {
	this.languages = { //supported languages
		english: true	
	};
	
	this.calls = function() {
		
		var words = knwlInstance.words.get('words'); //get the String as an array of words
		var resultsArray = [];
		var results = [];
		var number = '';
		
		for (var w in words) {
			var word = words[w];
			word = word.replace(/[()<>\/\'\+\-a-zA-Z]/g, ' ');
			wordSplit = word.split(' ');

			for (var w2 in wordSplit) {
				if (wordSplit[w2].match(/[1-9]/)) {
					number += wordSplit[w2];
				} else {
					if (number !== '') {
						if (number.length >= 7) {
							resultsArray.push(number);
						}
					}
					number = '';
				}
			}
		}

		/* Remove duplicates */
		for (var r in resultsArray) {
			if (results.indexOf(resultsArray[r]) === -1) {
				results.push(resultsArray[r]);
			}
		}
		
	    return results;
	};
}