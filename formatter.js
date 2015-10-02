! function (d) {
    var
        toSt = Object.prototype.toString,
        createContent = function (t, l) {
            t = toSt.call(t) === '[object String]' ? t: '';
            l = toSt.call(l) === '[object Number]' ? l : 0;
            var df = l - t.length;
            return df > 0 ? (t + Array(df >> 1).join("&nbsp ")) : t;
        },
        span = d.querySelector('.wrapper .underlying');
    if (span) {
        span.innerHTML = createContent('I like to move it, baby! ', 400);
    }
}(document);

/**
 * http://jsfiddle.net/44b92kfb/
 */
