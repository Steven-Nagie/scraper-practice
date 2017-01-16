// Request is used to make HTTP requests
var request = require('request');
// Cheerio is used to parse and select HTML elements on the page. Looks like and functions like jQuery
var cheerio = require('cheerio');
// URL is used to parse URLs
var URL = require('url-parse');

var pagesToVisit = ["http://www.arstechnica.com"];
let pagesVisited = new Set();

// This is a 'Request' request. Takes in the url and a callback
makeRequest = (pageToVisit) => {
  request(pageToVisit, function(error, response, body) {
    if(error) {
      console.log("Error: ", error);
    }

    if (response.statusCode === 200) {
      /*
        Parse document body using cheerio
        Assign what we get to $
        Use $('title') to get the html element called title, much like jQuery
        */
        var $ = cheerio.load(body);
        console.log("Page title: " + $('title').text());
      }
      searchForWord($, "technica");
      collectInternalLinks($);
    })
}

// This function will check to see if a word is in the body of the web page.
searchForWord = ($, word) => {
  console.log("Searching");
  // The > selects all direct child elements specified by "child" of elements specified by "parent". In this case it's looking at all body elements that are a child of the html element.
  var bodyText = $('html > body').text();

  if (bodyText.toLowerCase().indexOf(word.toLowerCase()) !== -1) {
    return true;
  }

  return false
}

// This function will gather all relative (within the same domain) and absolute (on other domains) hyperlinks for a given page.
collectInternalLinks = ($) => {
  var allRelativeLinks = [];
  var allAbsoluteLinks = [];

  // ^ selects the specified attribute with a value beginning exactly with the given string. So it checks that the a links have the attribute href that starts with /. This will get us relative links (routing within the domain).
  var relativeLinks = $("a[href^='/']");
  relativeLinks.each(function() {
      allRelativeLinks.push($(this).attr('href'));
  });

  var absoluteLinks = $("a[href^='http']");
  absoluteLinks.each(function() {
      allAbsoluteLinks.push($(this).attr('href'));
  });

  console.log("Found " + allRelativeLinks.length + " relative links");
  console.log("Found " + allAbsoluteLinks.length + " absolute links");
}

pagesToVisit.forEach((nextPage) => {
  if (nextPage in pagesVisited) {
    return;
  } else {
    pagesVisited.add(nextPage);
    console.log("Visiting page " + nextPage);
    makeRequest(nextPage);
    return;
  }
})
