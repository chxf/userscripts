// ==UserScript==
// @name         Gmail (C)lean Look
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Makes GMail look (c)lean again
// @author       Christoph Flake
// @match        https://mail.google.com/*
// @grant        GM_addStyle
// ==/UserScript==
/* jshint -W097 */
'use strict';

var ICON_URL = "https://ssl.gstatic.com/ui/v1/icons/mail/favicon.ico";

function g_compose(fn, var_args) {
  var functions = arguments;
  var length = functions.length;
  return function() {
    var result;
    if (length) {
      result = functions[length - 1].apply(this, arguments);
    }

    for (var i = length - 2; i >= 0; i--) {
      result = functions[i].call(this, result);
    }
    return result;
  };
};

function g_map(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(/** @type {?} */ (opt_obj), obj[key], key, obj);
  }
  return res;
};

function g_create(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }

  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }

  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};

function g_getValues(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};

function buildStyleString(map) {
  var mapValues = g_compose(g_getValues, g_map);
  return mapValues(map, function(rules, selector) {
    var rulesetString = mapValues(rules, function(val, prop) {
      return prop + ':' + val + ';';
    }).join('');
    return selector + '{' + rulesetString + '}';
  }).join('');
};

function remoteOtherFavicon() {
  var links = window.document.getElementsByTagName('link');
  for (var i = 0; i < links.length; i++) {
	var lnk = links[i];
	if ((lnk.rel == "icon" || lnk.rel == "shortcut icon") && lnk.href != ICON_URL) {
	  lnk.parentNode.removeChild(lnk);
	}
  }
}

function updateFavicon() {
  var favicon = window.document.createElement('link');
  favicon.rel = "shortcut icon";
  favicon.href = ICON_URL;
  Object.freeze(favicon);
  window.document.getElementsByTagName('head')[0].appendChild(favicon);
}

function applyStyles() {
  var style = buildStyleString(g_create(
	// hide useless buttons
	'#itamenu', {
	  'display': 'none !important' 
	},
	// hide Inbox count
	'a[title^="Inbox ("]', {
	  'visibility': 'hidden',
	  'position': 'relative'
	},
	'[title^="Inbox ("]:after', {
	  'content': '"Inbox"',
	  'visibility': 'visible',
	  'position': 'absolute',
	  'left': 0,
	  'font-weight': 'bold'
	}
  ));
  console.log(style);
  GM_addStyle(style);
}

updateFavicon();
applyStyles();
