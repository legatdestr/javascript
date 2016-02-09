/**
 * @param t {integer or Date}
 * @param firstDay {integer}
 * @returns {Date}
 */
function getFirstWeekDayByDate(t, firstDay) {
    "use strict";
    if (typeof t === 'undefined' || t === null
        || !(Object.prototype.toString.call(t) === '[object Date]'
        || (!isNaN(parseInt(t, 10)) && t > 0))) {
        throw new Error('t is incorrect');
    }
    if (typeof firstDay !== 'undefined' && isNaN(firstDay = parseInt(firstDay, 10))) {
        throw new Error('firstDay is not a number');
    }
    firstDay = firstDay === 0 ? 0 : (firstDay = firstDay < 7 ? firstDay : 1 ); // monday by default
    t = typeof t === 'object' ? t : new Date(parseInt(t, 10));
    var d = new Date(t.getTime()); // copy input param t
    d.setDate(d.getDate() - (d.getDay() === 0 ? 7 : d.getDay()  ) + firstDay);

    return d;
}

// Example
console.log(getFirstWeekDayByDate(new Date().getTime()));