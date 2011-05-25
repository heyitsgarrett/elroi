(function(ei, $) {

    /**
     *
     * @param {String} format Either 'time' or the datetime format string used by $.datepicker.formatDate
     * @param value The date to format
     * @param options Options for the date format; includes ignore zero minutes, and am/pm
     * @return {String} The formatted date
     */
    function formatDate(format, value, options) {

        if (!format) {
            return '';
        }
        options = options || {};

        var date = new Date(value);

        if (format == 'time') {
            var hours = date.getHours();
            var minutes = date.getMinutes();

            var ampm =  hours === 0 ? 'am'
                     : hours > 11 ? 'pm'
                     : 'am';


            hours = hours === 0 ? 12
                     : hours > 12 ? hours - 12
                     : hours;

            minutes = (minutes < 10 ? '0' : '')
                    + minutes;

            return hours + (options.ignoreZeroMinutes && minutes === '00' ? '' : ":" +  minutes) + (options.ampm ? ' ' + ampm : '');

        }
        else {
            return $.datepicker.formatDate(format, date);
        }


    }

    ei.formatDate = formatDate;

})(ei, jQuery);