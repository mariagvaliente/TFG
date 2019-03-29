const parseURL = (url) => {
  if (url === '') {
    return false;
  }
  var patt1 = /youtube.com\/watch\?v=(.*)/;
  var patt2 = /youtube.com\/embed\/(.*)/;
  var patt3 = /youtu.be\/(.*)/;
  if (patt2.exec(url)) {
    return url;
  }
  var code = patt1.exec(url);
  if (code) {
    return 'https://www.youtube.com/embed/' + code[1];
  }
  var code2 = patt3.exec(url);
  if (code2) {
    return 'https://www.youtube.com/embed/' + code2[1];
  }
  return false;
}

module.exports = {
  parseURL
}