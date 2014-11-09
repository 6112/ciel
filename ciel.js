/*
 * This script enables syntax highlighting for JavaScript inside `pre` and `code`
 * tags. It uses some CSS classes applied to spans to convert input source code 
 * into colored code.
 *
 * In order to use this module, simply give an element the `.highlight` class, 
 * and an optional `lang` attribute for the name of the programming language.
 *
 * To add support for more languages, edit the `languages` variable in this file.
 *
 * By Nicolas Ouellet-Payeur.
 * Oct 09, 2014.
 */

// Return an object representing how to parse a given programming language.
//
// The returned object can be passed to the Parser() constructor as the
// `language` argument.
//
// options:
//   [keywords] (String array) List of keywords
//   [constants] (String array) List constants
//   [builtins] (String array) List of built-in functions
//   [doubleString] (Boolean) true iff strings can be delimited by ""
//   [singleString] (Boolean) true iff strings can be delimited by ''
//   [commentDelimiter] (String) Comment delimiter for single-line comments.
//   [matchers] (Object array) Additional matchers for any non-standard
//     syntax elements. Elements of this list should be created with
//     matcher(), multimatcher(), skipper(), multiskipper(). Have priority
//     over standard syntax elements.
var language = function(options) {
  var matchers = [];
  // match the specified keywords
  if (options.keywords)
    matchers.push(matcher(new RegExp('(' + options.keywords.join('|') + ')\\b'), 'keyword'));
  // match the specified constants
  if (options.constants)
    matchers.push(matcher(new RegExp('(' + options.constants.join('|') + ')\\b'), 'value'));
  // match the specified built-in functions
  if (options.builtins)
    matchers.push(matcher(new RegExp('(' + options.builtins.join('|') + ')\\b'), 'builtin'));
  // match numbers
  matchers.push(matcher(new RegExp(defaults.number), 'value'));
  // match strings
  var stringRegexps = [];
  if (options.doubleString) stringRegexps.push(defaults.doubleString);
  if (options.singleString) stringRegexps.push(defaults.singleString);
  if (options.doubleString || options.singleString)
    matchers.push(matcher(new RegExp(stringRegexps.join('|')), 'string'));
  // match comments
  if (options.commentDelimiter)
    matchers.push(matcher(new RegExp(options.commentDelimiter + '.*$'), 'comment'));
  // add custom matchers, with higher priority than the rest
  matchers = options.matchers.concat(matchers);
  // skip symbols
  matchers.push(skipper(new RegExp(defaults.symbol)));
  // skip whitespace
  matchers.unshift(skipper(new RegExp(defaults.whiteSpace)));
  var duplicateRegexp = function(prefix, regexp, suffix) {
    return new RegExp(prefix + regexp.source + suffix, regexp.ignoreCase ? 'i' : '');
  };
  _.each(matchers, function(matcher, index) {
    // modify 'regexp', 'startRegexp', and 'endRegexp' so that they only match
    // the beginning of a line
    _.each(['regexp', 'startRegexp'], function(key) {
      if (matcher[key]) 
        matcher[key] = duplicateRegexp('^(', matcher[key], ')');
    });
  });
  return matchers;
};

// default values for a language's syntax (when nondescript), and
// standard syntax elements for most languages
var defaults = {
  doubleString: '"([^"\\\\]|\\\\.)*"',
  singleString: "'([^'\\\\]|\\\\.)*'",
  number: '-?[0-9]+(\\.[0-9]*)?|-?\\.[0-9]+|0x[0-9a-fA-F]+',
  symbol: '\\w+',
  whiteSpace: '\\s+'
};

// used in options.matchers in language() to add a matcher for any
// regular expression, for single-line matches
var matcher = function(regexp, className) {
  return {
    regexp: regexp,
    className: className
  }
};

// used in options.matchers in language() to add a matcher for any
// regular expression, for multi-line matches
var multimatcher = function(startRegexp, endRegexp, className) {
  return {
    startRegexp: startRegexp,
    endRegexp: endRegexp,
    className: className,
    multiline: true
  }
};

// used in options.matchers in language() to add a matcher that always
// skips a given regular expression, for single-line matches
var skipper = function(regexp) {
  return {
    regexp: regexp
  };
};

// used in options.matchers in language() to add a matcher that always
// skips a given regular expression, for multi-line matches
var multiskipper = function(startRegexp, endRegexp) {
  return {
    startRegexp: startRegexp,
    endRegexp: endRegexp,
    multiline: true
  };
};

// list of supported languages
var languages = {
  // JavaScript
  javascript: language({
    doubleString: true,
    singleString: true,
    keywords: [
      'function', 'return', 'with',
      'if', 'else', 'switch', 'case', 'default',
      'while', 'for', 'in', 'do', 'break', 'continue',
      'typeof', 'instanceof',
      'var', 'this', 'void', 'new',
      'throw', 'try', 'catch', 'finally'
    ],
    constants: [
      'true', 'false', 'null', 'undefined'
    ],
    builtins: [
      'prototype', 'String', 'Number', 'Array', 'Object', 'RegExp',
      'parseInt', 'parseFloat', 'valueOf', 'toString',
      'length', 'substr', 'substring', 'charAt', 'match', 'search', 'split',
      'indexOf', 'lastIndexOf', 'replace', 'toUpperCase', 'toLowerCase',
      'slice', 'splice', 'push', 'shift', 'unshift', 'pop', 'join',
      'test', 'exec',
      'console', 'log',
      'window', 'document', 'body',
      'eval', 'JSON'
    ],
    commentDelimiter: '//',
    matchers: [
      multimatcher(/^\/\*/, /\*\//, 'comment'),
      matcher(new RegExp('/([^/\\\\]|\\\\.)+/[gimy]*'), 'regexp')
    ]
  }),
  
  // Python
  python: language({
    doubleString: true,
    singleString: true,
    keywords: [
      'def', 'return', 'with', 'pass', 'lambda',
      'if', 'else', 'elif',
      'while', 'for', 'in', 'continue', 'break',
      'self',
      'class',
      'try', 'except', 'finally'
    ],
    constants: [
      'True', 'False', 'None'
    ],
    builtins: [
      'list', 'str', 'set', 'dict', 'int', 'float', 'tuple', 'object',
      'map', 'filter', 'sum', 'range', 'all', 'any', 'len', 'iter',
      'reversed', 'sorted', 'slice', 
      'eval', 'dir',
      'ord', 'chr',
      'min', 'max', 'abs', 'round',
      'isinstance', 'issubclass', 'super', 'type'
    ],
    commentDelimiter: '#',
    matchers: [
      multimatcher(/^"""/, /"""/, 'string')
    ]
  }),
  
  // Lua
  lua: language({
    doubleString: true,
    singleString: true,
    keywords: [
      'function', 'return', 'end',
      'if', 'else', 'elseif', 'then',
      'while', 'for', 'in', 'continue', 'break', 'do', 'repeat', 'until',
      'local',
      'and', 'or', 'not', '#'
    ],
    constants: [
      'true', 'false', 'nil'
    ],
    builtins: [
      'print', 'tostring', 'tonumber',
      'string', 'type',
      'math', 'require',
      'pairs', 'ipairs',
      'io', 'read',
      'error', 'os',
      'table', 'setmetatable', 'getmetatable'
    ],
    commentDelimiter: '--',
    matchers: [
      multimatcher(/^--\[\[/, /\]\]/, 'comment'),
      multimatcher(/^--\[==\]/, /\]==\]/, 'comment'),
      multimatcher(/^\[\[/, /\]\]/, 'string'),
      multimatcher(/^\[==\[/, /\]==\]/, 'string')
    ]
  }),
  
  // CSS
  css: language({
    doubleString: true,
    singleString: true,
    keywords: [
      'a', 'div', 'span', 'body', 'pre', 'code',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'input', 'button', 'b', 'em'
    ],
    matchers: [
      multimatcher(/^\/\*/, /\*\//, 'comment'),
      matcher(/\.(\w|-)+/, 'string'),
      matcher(/#(\w|-)+/, 'builtin'),
      matcher(/(\w|-)+\s*(?=:)/, 'keyword'),
      matcher(/::?(\w+|-)+/, 'value'),
      matcher(/-?([0-9]+(\.[0-9]*)?|\.[0-9]+)(px|em|%)/, 'value')
    ]
  }),
  
  // HTML
  html: language({
    doubleString: true,
    singleString: true,
    matchers: [
      multimatcher(/^&lt;!--/, /--&gt;/, 'comment'),
      matcher(/&lt;\s*!doctype.*?&gt;/i, 'comment'),
      matcher(/&lt;\/?\w*/, 'keyword'),
      matcher(/\w+=/, 'builtin'),
      matcher(/\/?&gt;/, 'keyword'),
      matcher(/&amp;\w+;/, 'string')
    ]
  })
};
  
// class for a code parser
//
// use .run() to execute the parsing of the code
var Parser = function(code, language) {
  this.lines = code.split('\n');
  this.length = code.length;
  // current position (character index)
  this.pos = 0;
  // current position (row and column)
  this.row = 0;
  this.col = 0;
  // list of matchers, in the order in which to apply them
  this.language = language;
};

// returns the list of matchers for this parser
Parser.prototype.matchers = function() {
  return languages[this.language];
};

// move the current position `pos` by `n` characters forward
//
// `row` and `col` are also updated as a result
Parser.prototype.forward = function(n) {
  if (! _.isNumber(n)) {
    n = 1;
  }
  var m = n;
  while (m > this.thisLine().length - this.col) {
    m -= this.thisLine().length - this.col + 1;
    this.row++;
    this.col = 0;
  }
  this.col += m;
  this.pos += n;
};

// returns the character at the current position
Parser.prototype.thisChar = function() {
  if (this.col === this.thisLine().length) {
    return '\n';
  }
  return this.lines[this.row][this.col];
};

// returns the current line
Parser.prototype.thisLine = function() {
  return this.lines[this.row];
};

// returns the current line, with everything before the current
// position removed
Parser.prototype.thisLineRest = function() {
  return this.thisLine().substr(this.col);
};

// runs the parser and returns HTML for colorized code
Parser.prototype.run = function() {
  this.pos = 0;
  this.row = 0;
  this.col = 0;
  var output = [];
  while (this.pos < this.length) {
    var lineRest = this.thisLineRest();
    var match = null;
    _.find(this.matchers(), function(matcher) {
      match = applyMatcher(this, matcher, lineRest);
      return match;
    }, this);
    if (match === null || match === undefined) {
      output.push(this.thisChar());
      this.forward();
    }
    else {
      output.push(match);
    }
  }
  return output.join('');
};

// applies a single matcher, on the given line, for the selected parser
// the matcher can be either multiline or single-line
var applyMatcher = function(parser, matcher, line) {
  if (! matcher.multiline)
    return applySimpleMatcher(parser, matcher, line);
  return applyMultiMatcher(parser, matcher, line);
};

// used by applyMatcher to apply single-line matchers
var applySimpleMatcher = function(parser, matcher, line) {
  var regexp = new RegExp('^(' + matcher.regexp.source + ')');
  var match = matcher.regexp.exec(line);
  if (! match) return null;
  var output = '';
  if (matcher.className) output += '<span class="' + matcher.className + '">';
  output += match[0];
  if (matcher.className) output += '</span>';
  parser.forward(match[0].length);
  return output;
};

// used by applyMatcher to apply multi-line matchers
var applyMultiMatcher = function(parser, matcher, here) {
  if (! matcher.startRegexp.test(here)) return null;
  var match = matcher.startRegexp.exec(here);
  var output = [];
  if (matcher.className)
    output.push('<span class="' + matcher.className + '">');
  output.push(match[0]);
  here = here.substr(match[0].length);
  parser.forward(match[0].length);
  while (! matcher.endRegexp.test(here)) {
    output.push(here + '\n');
    parser.forward(here.length + 1);
    here = parser.thisLineRest();
  }
  match = matcher.endRegexp.exec(here);
  output.push(here.substr(0, match.index));
  output.push(match[0]);
  parser.forward(match.index + match[0].length);
  if (matcher.className)
    output.push('</span>');
  return output.join('');
};

// apply the syntax highlighting for every <pre> and <code> tag
$('.highlight').each(function() {
  // color the code
  var self = $(this);
  var before = self.html();
  var lang = self.attr('lang') || 'javascript';
  if (lang && languages[lang]) {
    var after = new Parser(before, lang).run();
    self.html(after);
  }
  // add line numbers
  if (self.prop('tagName') === 'PRE') {
    var newLines = before.match(/\n/g);
    var lineCount = newLines ? newLines.length : 1;
    var lines = _.map(_.range(1, lineCount + 1), function(n) {
      return n.toString();
    });
    var lineNumbers = $('<div class="line-numbers"></div>');
    lineNumbers.html(lines.join('<br />'));
    self.prepend(lineNumbers);
  }
});
