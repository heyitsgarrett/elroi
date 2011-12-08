(function($) {

    var elroi = function(element, dataSeries, graphOptions, tooltips) { return new e(element, dataSeries, graphOptions, tooltips); };

    elroi.fn = {};

    window.elroi = elroi;


    /**
     * Creates an graph in a given empty div
     * Usage: see /test/elroi.js for an example usage (this is commented out currently due to WebTestJS erroring out)
     * @param args An object containing
     *          $el - jQ DOM element to insert the graph into
     *          data - An array of series objects containing series data, and series options
     *          options - options for the graph
     * @return graph The graph object
     * @return {function} draw Method to draw the graph
     * @return {function} update Updates the graph with new data
     */
    function e(element, dataSeries, graphOptions, tooltips) {
        var defaults = {
            animation: true,
            colors: ['#99cc33', '#ffee44', '#ffbb11', '#ee5500', '#33bbcc', '#88ddee'],
            labelDateFormat: 'M',
            errorMessage : false,
            labelWidth : 'auto',
            flagOffset : 5,
            skipPointThreshhold : 18,
            grid : {
                show: true,
                showBaseline: true,
                numYLabels : 5
            },
            axes : {
                x1 : {
                    customXLabel: false,
                    id : 'x1',
                    type: 'date',
                    show : true,
                    labels : [],
                    seriesIndex : 0    // By default, the axis values are derived from the first series of data
                },
                x2 : {
                    customXLabel: false,
                    id : 'x2',
                    type : 'text',
                    show : false,
                    labels : [],
                    seriesIndex : 0
                },
                y1 : {
                    id : 'y1',
                    show : true,
                    unit: '',
                    topUnit: '',
                    prefixUnit: false,
                    seriesIndex : 0
                },
                y2 : {
                    id : 'y2',
                    show : false,
                    unit: '',
                    topUnit: '',
                    prefixUnit: false,
                    seriesIndex: 0
                }
            },
            tooltip: {
                formatter : function(tip){return tip},
                show: true,
                width: 120
            },
            seriesDefaults: {
                type: 'line',
                showPoints: false,
                fillPoints: false,
                labelPoints: false,
                animatePoints : false,
                pointStroke: true,
                interpolateNulls : false,
                maxYValue : 'auto',
                minYValue : 0,
                unit: '',
                pointLabelUnits: ''
            },
            bars : {
                highlightBorderWidth : 2,
                highlightBorderOpacity : 0.8,
                highlightColor : '#ccc',
                flagPosition: 'exterior' // exterior or interior - the label appears above or inside the bar
            },
            lines : {
                width : 2,
                opacity : 0.8,
                fillOpacity : 0.2,
                pointRadius : 3,
                pointStrokeWidth : 2,
                highlightStrokeWidth : 4,
                highlightRadius : 6,
                highlightOpacity : 0.8
            },
            padding: {top:15, right:20, bottom:18, left:50}
        };

        var $el = $(element)
                    .addClass('elroi'),
            $paper = $('<div></div>')
                        .addClass('paper')
                        .appendTo($el),
            options = $.extend(true, {}, defaults, graphOptions);

        var width = $paper.width() || $el.width(),
            height = $paper.height() || $el.height();

        var graph = elroi.fn.init({
            padding : options.padding,
            labelLineHeight: 12,
            width: width,
            height: height,
            allSeries: dataSeries,
            $el: $el,
            paper: Raphael($paper.get(0), width, height),
            argGraphOpts: options,
            options: options,
            tooltips: tooltips
        });

        var html = '<div class="elroi-tooltip"><div class="elroi-tooltip-content"></div></div>';
        graph.$tooltip = $(html);

        graph.$tooltip.width(graph.options.tooltip.width).appendTo($el.find('.paper')).addClass('png-fix');
        $el.mouseleave(function() {
            graph.$tooltip.css('left', -10000);
        });

        /**
         * Draws the graph grid, any error messaging, and any charts and graphs for all data
         */
        function draw() {

            var isGridDrawn = false;

            if(graph.options.errorMessage) {
                 var $errorMsg = $('<div class="elroi-error">' + graph.options.errorMessage + '</div>')
                    .addClass('alert box');

                graph.$el.find('.paper').prepend($errorMsg);
            }

            if(!graph.allSeries.length) {
                elroi.fn.grid(graph).draw();
            }

            $(graph.allSeries).each(function(i) {

                if(!isGridDrawn && graph.seriesOptions[i].type != 'pie') {
                    elroi.fn.grid(graph).draw();
                    isGridDrawn = true;
                }

                var type = graph.seriesOptions[i].type;
                elroi.fn[type](graph, graph.allSeries[i].series, i).draw();

            });

        }

        /**
         * Deletes all of the Raphael objects, and removes the axes from the graph
         */
        function clearGraph() {
            graph.paper.clear();

            graph.$el.find('ul').remove();
            graph.$el.find('.elroi-point-flag').remove();
            graph.$el.find('.elroi-point-label').remove();
        }

        /**
         * Redraws the graph with new data
         * @param newData A new data object to be graphed
         */
        function update(newData) {
           clearGraph();
           graph.allSeries = newData;

           draw();
        }

        return {
            graph: graph,
            draw: draw,
            update: update
        };
    }


})(jQuery);
(function(elroi, $) {

    /**
     *
     * @param {String}
        The format can be combinations of the following:
        d  - day of month (no leading zero)
        dd - day of month (two digit)
        D  - day name short
        DD - day name long
        m  - month of year (no leading zero)
        mm - month of year (two digit)
        M  - month name short
        MM - month name long
        y  - year (two digit)
        yy - year (four digit)
        h  - hour (single digit)
        hh - hour (two digit)
        H  - hour (military, no leading zero)
        HH  - hour (military, two digit)
        nn - minutes (two digit)
        a - am/pm
     * @param value The date to format
     * @param options Options for the date format; includes ignore zero minutes, and am/pm
     * @return {String} The formatted date
     */
    function formatDate(format, value, options) {
        var DAY_NAMES_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
            DAY_NAMES_LONG = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
            MONTH_NAMES_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
            MONTH_NAMES_LONG = ['January','Feburary','March','April','May','June','July','August','September','October','November','December'],
            date = new Date(value),
            dayNamesShort,
            dayNamesLong,
            monthNamesShort,
            monthNamesLong,
            formattedDate = "",
            thisChar,
            isDoubled,
            i;

        if (!format) {
            return '';
        }
        options = options || {};
        dayNamesShort = options.dayNamesShort || DAY_NAMES_SHORT;
        dayNamesLong = options.dayNamesLong || DAY_NAMES_LONG;
        monthNamesShort = options.monthNamesShort || MONTH_NAMES_SHORT;
        monthNamesLong = options.monthNamesLong || MONTH_NAMES_LONG;

        for(i = 0; i < format.length; i++) {
            thisChar = format.charAt(i);
            isDoubled = i < format.length && format.charAt(i + 1) === thisChar;

            switch (thisChar) {
                case 'd':
                    if(isDoubled) {
                        if(date.getDate() < 10) {
                            formattedDate += '0'
                        }
                        formattedDate += date.getDate();
                    } else {
                        formattedDate += date.getDate();
                    }
                    break;
                case 'D':
                    formattedDate += isDoubled ? dayNamesLong[date.getDay()] : dayNamesShort[date.getDay()];
                    break;
                case 'm':
                    if(isDoubled) {
                        if(date.getMonth() < 10) {
                            formattedDate += '0'
                        }
                        formattedDate += date.getMonth() + 1;
                    } else {
                        formattedDate += date.getMonth() + 1;
                    }
                    break;
                case 'M':
                    formattedDate += isDoubled ? monthNamesLong[date.getMonth()] : monthNamesShort[date.getMonth()];
                    break;
                case 'y':
                    if(isDoubled) {
                        formattedDate += date.getFullYear();
                    } else {
                        if(value.getFullYear() % 100 < 10){
                            formattedDate += 0;
                        }
                        formattedDate += date.getFullYear() % 100;
                    }
                    break;
                case 'h':
                    if(isDoubled && date.getHours()  % 12 < 10) {
                        formattedDate += "0";
                    }
                    formattedDate += date.getHours() === 0 ? 12
                        : date.getHours() > 12 ? date.getHours() - 12
                        : date.getHours();
                    break;
                case 'H':
                    formattedDate += isDoubled && date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
                    break;
                case 'n':
                    formattedDate += date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
                    break;
                case 'a':
                    formattedDate += date.getHours() < 12 ? 'am' : 'pm';
                    break;
                default:
                    formattedDate += thisChar;
            }
            if(isDoubled) {
                i++;
            }
        }

        return formattedDate;
    }

    elroi.fn.formatDate = formatDate;

})(elroi, jQuery);
(function(elroi, $) {

    var helpers = {

        /**
         * Checks and sees if the graph has any data to actually display
         * @param {Array} allSeries An array of all of the series in the graph
         * @returns {Boolean} hasData Does the graph have data
         */
        hasData : function(allSeries){
            var hasData = true;

            hasData = allSeries !== undefined
                    && allSeries.length
                    && allSeries[0] !== undefined
                    && allSeries[0].series !== undefined
                    && allSeries[0].series.length;


            $(allSeries).each(function(i) {
                if(!this || !this.series[0]) {
                    hasData = false;
                }
            });

            return !!hasData;
        },

        /**
         * Iterates through all of the data values in a single series, and puts them into an array depending on the series type
         * @param {Array} allSeries All of the series in the graph
         * @param {Array} seriesOptions The set of series options for the graph
         * @return {Array} dataValues An array of the data values for a series
         */
        getDataValues : function(allSeries, seriesOptions) {

            var dataValuesSet = [];

            if(!elroi.fn.helpers.hasData(allSeries)){
                return [[0]];
            }

            $(allSeries).each(function(i) {

                var dataValues = [],
                    series = allSeries[i].series;

                $(series).each(function(j) {
                    var singleSeries = series[j];

                    $(singleSeries).each(function(k) {
                        if (j === 0 || seriesOptions[i].type != 'stackedBar') {
                            dataValues.push(+this.value);
                        }
                        else {
                            dataValues[k] += this.value;
                        }
                    });

                });

                dataValuesSet.push(dataValues);

            });

            return dataValuesSet;
        },

        /**
         * Iterates a data set and returns the sum of all values
         * @param {Array} dataSet
         * @return {Int} sum
         */
        sumSeries : function(allData) {

            var sums = [];

            $(allData).each(function(i){
                var singleSeries = this,
                    sum = 0;
                $(singleSeries).each(function (j){
                    sum += this;
                });
                sums.push(sum);
            });
            return sums;
        },

        /**
         * Goes through each data point in every series and figures out if any of them have point flags
         * @param {Array} allSeries All of the series to be shown on the graph
         * @returns {Boolean} hasPointFlags
         */
        hasPointFlags: function(allSeries){

            var hasPointFlags = false;

            $(allSeries).each(function(i){
                $(allSeries[i].series).each(function(j){
                    $(allSeries[i].series[j]).each(function(k){
                        if (allSeries[i].series[j][k].pointFlag) {
                            hasPointFlags = true;
                        }
                    });
                });
            });

            return hasPointFlags;
        },

        /**
         * Determines minimum values for each datavalues set
         * @param {Object} dataValuesSet
         * @param {Object} seriesOptions
         * @returns {Array} The array of minumum values to use in the scaling & axes
         */
        minValues : function(dataValuesSet, seriesOptions) {
            var minVals = [];

            $(dataValuesSet).each(function(i) {
                minVals.push(seriesOptions[i].minYValue);
            });

            return minVals;
        },

        /**
         * Gets the maximum values for each series
         * @param {Array} dataValuesSet
         * @param {Array} seriesOptions
         * @param {Object} graph
         * @returns {Array} The array of each values to use for scales & axes
         */
        maxValues : function(dataValuesSet, seriesOptions, graph) {
            var maxVals = [];

            $(dataValuesSet).each(function(i) {
                if (seriesOptions[i].maxYValue == 'auto') {
                    maxVals.push(Math.max.apply(Math, dataValuesSet[i]));
                } else {
                    maxVals.push(seriesOptions[i].maxYValue);
                }
            });


            /**
             * Helper function to figure out of we should distort the maximum values to make room for flags, messages, et
             * @returns {Number} The scale to multiply against each of the max values to make some room
             */
            function distortMaxValuesBy() {

                var pixelsNeeded = 0;

                if(graph.options.errorMessage) {
                    var $errorMsg = $('<div id="graph-error">' + graph.options.errorMessage + '</div>').addClass('alert box').appendTo(graph.$el.find('.paper'));
                    pixelsNeeded += $errorMsg.outerHeight() + $errorMsg.position().top * 2;
                    $errorMsg.remove();
                }

                var hasPointFlags = elroi.fn.helpers.hasPointFlags(graph.allSeries);
                if (hasPointFlags && graph.options.bars.flagPosition != 'interior') {
                     var $pointFlag = $('<div class="point-flag"><div class="flag-content">Test flag</div></div>').appendTo(graph.$el.find('.paper'));
                     pixelsNeeded += $pointFlag.outerHeight();
                     $pointFlag.remove();
                }

                if(graph.options.axes.x2.show) {
                    var $x2 = $('<ul class="x-ticks x2"><li>test axis</li></ul>').appendTo(graph.$el);
                    pixelsNeeded += $x2.find('li').outerHeight() + graph.labelLineHeight;
                    $x2.remove();
                }

                return 1 + pixelsNeeded/graph.height;
            }

            var scaleDistortion = distortMaxValuesBy();

            maxVals = $.map(maxVals, function(val){
                return !!val ? val * scaleDistortion : 1;
            });

            return maxVals;
        },



        /**
         * Sets up an array of series specific options for each series to graph
         * @param {Array} allSeries An array of series, each with their own options
         * @param defaults Default options to merge in
         * @returns {Array} seriesOptions
         */
        seriesOptions : function(allSeries, defaults) {

            var seriesOptions = [];

            if(! allSeries.length) {
                return [defaults];
            }

            $(allSeries).each(function(i) {
                seriesOptions.push($.extend({}, true, defaults, allSeries[i].options));
            });

            return seriesOptions;
        },

        buildDefaultTooltips : function(allSeries) {
            var tooltips = [];
            $(allSeries).each(function(i) {
                $(this.series).each(function(j){
                    $(this).each(function(k){
                        if(tooltips[k]) {
                            tooltips[k] += "<br/>" + this.value;
                        } else {
                            tooltips[k] = "" + this.value;
                        }
                    });
                });
            });
            return tooltips;
        }
    };

    /**
     * Goes over the data series passed in, and sets things up for use by other elroi functions.
     * This adds the following properties to the graph object:
     * numPoints - The number of points on the graph
     * showEvery - This is used to suppress some points on the line graph, and some labels on the x-axis
     * xTicks - The number of x ticks on the graph per pixel
     * yTicks - an array of y ticks on the graph per pixel, per series
     * seriesOptions - an array of options per series, merged with the defaults
     * maxVals - an array of the maximum values of each series
     * minVals - an array of the minimum values of each series
     *
     * @see elroi
     * @param graph The initial graph object
     * @return graph The updated graph object containing the new values listed above
     */
    function init(graph) {

        var seriesOptions = elroi.fn.helpers.seriesOptions(graph.allSeries, graph.options.seriesDefaults),
            maxVals = [],
            minVals = [],
            dataValuesSet = elroi.fn.helpers.getDataValues(graph.allSeries, seriesOptions),
            sums = elroi.fn.helpers.sumSeries(dataValuesSet),
            hasData = elroi.fn.helpers.hasData(graph.allSeries);

        var numPoints = !hasData ? 1 : graph.allSeries[0].series[0].length;

        var showEvery = graph.options.showEvery ||
                ((numPoints > graph.options.skipPointThreshhold) ? Math.round(numPoints / graph.options.skipPointThreshhold) : 1);

        var xTick = (graph.width - graph.padding.left - graph.padding.right) / numPoints;
        var yTicks = [];

        maxVals = elroi.fn.helpers.maxValues(dataValuesSet, seriesOptions, graph);
        minVals = elroi.fn.helpers.minValues(dataValuesSet, seriesOptions);

        $(dataValuesSet).each(function(i) {
            var avalaibleArea = graph.height - graph.padding.top - graph.padding.bottom,
                dataRange = maxVals[i] + Math.abs(minVals[i]);

            yTicks.push(avalaibleArea/dataRange);
        });

        var labelWidth =
            graph.options.labelWidth == 'auto' ?
                (graph.width - graph.padding.left - graph.padding.right) / (numPoints/showEvery) - 2  :  //padding of 2px between labels
                graph.options.labelWidth;

        var barWidth = xTick * 2/3; // 2/3 is magic number for padding between bars

        var barWhiteSpace = (xTick * 1/3) / 2;

        $.extend(graph, {
            hasData : hasData,
            seriesOptions: seriesOptions,
            dataValuesSet: dataValuesSet,
            maxVals: maxVals,
            minVals: minVals,
            sums: sums,
            numPoints: numPoints,
            showEvery: showEvery,
            xTick: xTick,
            yTicks: yTicks,
            labelWidth: labelWidth,
            barWidth: barWidth,
            barWhiteSpace: barWhiteSpace
        });

        if(graph.options.tooltip.show && graph.tooltips === undefined) {
            graph.tooltips = elroi.fn.helpers.buildDefaultTooltips(graph.allSeries);
        }

        return graph;
    }

    elroi.fn.helpers = helpers;
    elroi.fn.init = init;

})(elroi, jQuery);
(function(elroi, $){

    /**
     * This function creates the grid that is used by the graph
     * @param {graph} graph The graph object defined by elroi
     * @return {function} draw Draws the grid, x-axis, and y-axes
     */
    function grid(graph){

        /**
         * Goes through the first series in a data set and creates a set of labels for the x-axis
         * @param data All series to be graphed
         * @param {String} dateFormat
         * @return {Array} xLabels An array of correctly formatted labels for the x-axis
         */
        function getXLabels(series, dateFormat){

            var xLabels = [];

            $(series).each(function(){

                var startDate,
                    startDateFormat = dateFormat,
                    endDateFormat = dateFormat,
                    endDate,
                    label = '';

                if(this.startDate) {
                    startDate = new Date(this.startDate);
                }

                if (this.endDate) {
                    endDate = new Date(this.endDate);
                }

                if (this.startDate && this.endDate) {
                    if (startDate.getMonth() == endDate.getMonth()) {
                        endDateFormat = endDateFormat.replace('M', '' && startDateFormat.match('M'));
                    }
                    if (startDate.getFullYear() == endDate.getFullYear() && startDateFormat.match(', yy')) {
                        startDateFormat = startDateFormat.replace(', yy', '');
                    }
                }

                if (this.startDate) {
                    label += elroi.fn.formatDate(startDateFormat, startDate);
                }
                if(this.startDate && this.endDate) {
                    label += " &ndash;";
                }
                if(this.endDate) {
                    label += elroi.fn.formatDate(endDateFormat, endDate);
                    label = label.replace(/\s/g, '&nbsp;');
                }

                xLabels.push(label);
            });

            return xLabels;
        }

        /**
         * Draws the gridlines based on graph.grid.numYLabels
         */
        function drawGrid(){
            var i, y,
                gridLine,
                gridLines = graph.paper.set(),
                avalaibleArea = graph.height - graph.padding.top - graph.padding.bottom;

            if (graph.options.grid.show) {
                for (i = 0; i < graph.options.grid.numYLabels; i++) {
                    y = graph.height -
                        i / (graph.options.grid.numYLabels - 1) * avalaibleArea -
                        graph.padding.bottom +
                        graph.padding.top;
                    gridLine = graph.paper.path("M0" + " " + y + "L" + graph.width + " " + y).attr('stroke', '#ddd');
                    gridLines.push(gridLine);
                }
            } else if (graph.options.grid.showBaseline) {
                    y = graph.height -
                        graph.padding.bottom +
                        graph.padding.top;
                    gridLine = graph.paper.path("M0" + " " + y + "L" + graph.width + " " + y).attr('stroke', '#ddd');
                    gridLines.push(gridLine);
            }

            graph.grid = {
                lines: gridLines
            };
        }

        /**
         * Draws the x-axis
         * @param axis An axis object as defined in the elroi options
         */
        function drawXLabels(axis) {

            var $labels, axisY;

            if (axis.id == 'x1') {
                axisY = graph.height;
            } else if (axis.id == 'x2') {
                axisY = graph.padding.top;
            }

            if(axis.customXLabel) {
                $labels = $(axis.customXLabel);
            } else {

                $labels = $('<ul></ul>')
                        .addClass('x-ticks')
                        .addClass(axis.id);

                $(axis.labels).each(function(i){
                    if(i % graph.showEvery === 0) {
                        var x = i * graph.xTick + graph.padding.left;
                        var label = (axis.labels[i].replace(/^\s+|\s+$/g, '') || '');

                        $('<li></li>')
                            .css({top: axisY, left: x})
                            .html(label)
                            .appendTo($labels);
                    }
                });
            }


            $labels.find('li').each(function(){
                var $label = $(this);
                var x = parseInt($label.css('left'), 10) + ($label.width())/2;

                $label.css({ left: x, width: graph.labelWidth });

                if (axis.id == 'x2') {
                    $label.css( { top: axisY + $labels.height() + graph.padding.top });
                }
            });

            $labels.appendTo(graph.$el);

        }

        /**
         * Takes in a maximum value and a precision level, and returns an array of numbers for use in the y label
         * @param {number} maxVal The maximum value in a dataset
         * @param {number} precision The number of digits to show
         * @returns {Array} yLabels A set of labels for the y axis
         */
        function getYLabels(maxVal, minVal, precision){
            var yLabels = [],
                i;

            for (i = 0; i < graph.options.grid.numYLabels; i++) {

                var yLabel = i/(graph.options.grid.numYLabels-1) * (maxVal - minVal) + minVal;

                yLabel = yLabel.toFixed(precision);

                yLabels.push(yLabel);

            }
            return yLabels;
        }


        /**
         * This draws either the y1 or y2 axis, depending on the series data
         * @param {int} seriesDataIndex The index of the data series associated to this y-axis
         * @param {number} maxVal The maximum value in the data series
         * @param {number} minVal The minimum value in the data series
         * @param {String} unit The units of the data
         */
        function drawYLabels(maxVal, minVal, axis){

            var $yLabels = $('<ul></ul>')
                    .addClass("y-ticks")
                    .addClass(axis.id);

            var precision = 0,
                yLabels = getYLabels(maxVal, minVal, precision),
                avalaibleArea = graph.height - graph.padding.top - graph.padding.bottom;

            while(containsDupes(yLabels)) {
                precision++;
                yLabels = getYLabels(maxVal, minVal, precision);
            }

            $(yLabels).each(function(i){
                var yLabel = commaFormat(yLabels[i], precision);

                var y = graph.height
                        - i / (graph.options.grid.numYLabels - 1) * avalaibleArea
                        - graph.padding.bottom
                        + graph.padding.top
                        - graph.labelLineHeight;

                if(i === graph.options.grid.numYLabels-1) {
                    yLabel = (axis.prefixUnit ? axis.topUnit : '')
                            + yLabel
                            + (!axis.prefixUnit ? " " + axis.topUnit : '');
                } else {
                    yLabel = (axis.prefixUnit ? axis.unit : '')
                            + yLabel
                            + (!axis.prefixUnit ? " " + axis.unit : '');
                }

                var cssPosition;
                if (axis.id == 'y1') {
                    cssPosition = { 'top' : y, 'left' : 0 };
                }
                if (axis.id == 'y2') {
                    cssPosition = { 'top' : y, 'right' : 0 };
                }

                $('<li></li>')
                    .css(cssPosition)
                    .html(yLabel)
                    .appendTo($yLabels);
            });

            $yLabels.appendTo(graph.$el);
        }

        /**
         * Calls all other draw methods
         */
        function draw(){

            drawGrid();
            var seriesIndex;

            if(!graph.hasData) {
                return;
            }

            if(graph.options.axes.x1.show){
                if(!graph.options.axes.x1.labels || graph.options.axes.x1.labels.length === 0) {
                    seriesIndex = graph.options.axes.x1.seriesIndex;
                    graph.options.axes.x1.labels= getXLabels(graph.allSeries[seriesIndex].series[0], graph.options.labelDateFormat);
                }
                drawXLabels(graph.options.axes.x1);
            }
            if(graph.options.axes.x2.show && graph.hasData){
                if (!graph.options.axes.x2.labels || graph.options.axes.x2.labels.length === 0) {
                    seriesIndex = graph.options.axes.x2.seriesIndex;
                    graph.options.axes.x2.labels = getXLabels(graph.allSeries[seriesIndex].series[0], graph.options.labelDateFormat);
                }
                drawXLabels(graph.options.axes.x2);
            }

            if (graph.options.axes.y1.show) {
                drawYLabels(graph.maxVals[graph.options.axes.y1.seriesIndex], graph.minVals[graph.options.axes.y1.seriesIndex], graph.options.axes.y1);
            }
            if (graph.options.axes.y2.show) {
                drawYLabels(graph.maxVals[graph.options.axes.y2.seriesIndex], graph.minVals[graph.options.axes.y2.seriesIndex], graph.options.axes.y2);
            }
        }

        return {
            draw : draw
        };
    }

    function containsDupes(arr){
        var i, j, n;
        n= arr.length;

        for (i=0; i<n; i++) {
            for (j=i+1; j<n; j++) {
                if (arr[i] == arr[j]) {
                    return true;
                }
            }
        }
        return false;
    }

    function commaFormat (num, precision) {

        if (precision) {
            num = parseFloat(num); // Make sure this is a number
            num = precision === 'round' ? Math.round(num) : num.toFixed(precision);
        }

        num += '';

        var preDecimal,
            postDecimal,
            splitNum = num.split('.'),
            rgx = /(\d+)(\d{3})/;

        preDecimal = splitNum[0];
        postDecimal = splitNum[1] ? '.' + splitNum[1] : '';

        while (rgx.test(preDecimal)) {
            preDecimal = preDecimal.replace(rgx, '$1' + ',' + '$2');
        }

        return preDecimal + postDecimal;

    }

    elroi.fn.grid = grid;

})(elroi, jQuery);
(function(elroi){

    /**
     * Creates a line graph for a particulary series of data
     * @param {graph} graph The graph object defined in elroi
     * @param {series} series The series to graph as a line graph
     * @param {int} seriesIndex The index of this series
     * @return {function} draw Draws the line on the graph
     */
    function lines(graph, series, seriesIndex){

        var pointOffset = 0.5 * graph.labelWidth,
            yTick = graph.yTicks[seriesIndex],
            seriesOptions = graph.seriesOptions[seriesIndex];


         /**
         * Draws a single point
         * @param {Number} x - The x coordinate of the point
         * @param {Number} y - The y coordinate of the point
         * @param {Number} value - The value of that particular point (used for labeling)
         * @param {String} color - Color to draw the point in
         * @parama {Boolean} fillPoint - If the point should be filled with its color
         * @param {String} clickTarget - The url where the point should link to if clicked
         * @param {Boolean} animate - If the point should be animated.
         */
        function drawPoint(x, y, value, color, fillPoint, clickTarget, animate, stroke){

             if(stroke) {

                 var pointAttributes = {
                     'stroke': color,
                     'stroke-width': graph.options.lines.pointStrokeWidth,
                     'fill': '#fff'
                 };

                 function conditionallyFillPoint() {
                     if(fillPoint) {
                         point.attr({fill: color});
                     }
                 }

                 if(animate) {

                     var point = graph.paper.circle(x, y, 0).attr(pointAttributes);

                     conditionallyFillPoint();

                     point.animate({r:graph.options.lines.pointRadius}, 500, 'bounce');
                 }
                 else {

                     var point = graph.paper.circle(x, y, graph.options.lines.pointRadius).attr(pointAttributes);

                     conditionallyFillPoint();

                 }

                 $(point.node).click(function(){
                     if (clickTarget) {
                         document.location = clickTarget;
                     }
                 });

                 if (clickTarget) {
                     $(point.node).hover(
                             function() {
                                 point.node.style.cursor = "pointer";
                             },
                             function() {
                                 point.node.style.cursor = "";
                             }
                     );
                 }

             }
             else {

                 graph.paper.circle(x, y, graph.options.lines.width).attr({
                             stroke: 'none',
                             'fill': color
                         });
             }

        }

        /**
         * Draws labels on a point
         * @param {Number} x X coordinate of the point
         * @param {Number} y Y coordinate of the point
         * @param {Int} pointNumber The index of the point in its series
         * @param {Number} value The value of the point
         * @param {String} units The unit to append to the label
         * @param {String} color Color of the point label
         */
        function drawPointLabel(x, y, pointNumber, value, units, color){
            var isOffGraph = graph.height - graph.labelLineHeight < y,
                isInSetToShow = pointNumber % graph.showEvery === 0;

            if (!isOffGraph && isInSetToShow) {
                var pointLabel = document.createElement("span");
                $(pointLabel).addClass('elroi-point-label').html(Math.round(value) + " " + units).css({
                    'left': x - pointOffset,
                    'bottom': graph.paper.height - y - graph.labelLineHeight - pointOffset,
                    'width': graph.labelWidth,
                    'color': color
                });
                graph.$el.find('.paper').append(pointLabel);
            }
        }

        /**
         * Recursive function to draw a single series from start to end, one segment at a time
         * @param {Array} series - The series to draw as a line
         * @param {int} index - The current point being drawn
         * @param {Raphael Object} line - The line as it has currently been drawn
         * @param prevPoint - An object containing the x & y coordinates of the previous point plotted for this line
         * @param {Boolean} isLineFilled - Weather or not the line should be filled
         * @param {String} color - Color of the line
         * @param {Boolean} isLineStarted
         */

        function drawLine(args) {

            var series=args.series,
                index=args.index || 0,
                line=args.line,
                prevPoint=args.prevPoint,
                isLineFilled=args.isLineFilled,
                color=args.color,
                isLineStarted=args.isLineStarted,
                currentPath=args.currentPath || '',
                units=args.units;


            if(index == series.length) {
                return true;
            }

            var isNullPoint = !(series[index].value || series[index].value === 0);

            var x = index * graph.xTick + graph.padding.left + pointOffset,
                y = graph.height - ((series[index].value - seriesOptions.minYValue) * yTick) - graph.padding.bottom + graph.padding.top,
                pathString = "",
                animSpeed = (window.isIE6 ? 1 : 800)/series.length,
                isFirstPoint = !index;

            if(!prevPoint && !(seriesOptions.interpolateNulls || seriesOptions.type === 'step')) {
                isLineStarted = false;
            }

            if (!isFirstPoint && isLineStarted && !isNullPoint) {
                pathString = seriesOptions.type === 'step' ?
                    "L" + x + " " + prevPoint.y + "L" + x + " " + y  :
                    "L" + x + " " + y;
            } else if (isNullPoint && !isFirstPoint){
                pathString = "";
            }
            else {
                pathString = "M" + x + " " + y;

            }

            if(!isLineStarted && !isNullPoint) {
                isLineStarted = true;
            }

            var thisPoint;
            if(seriesOptions.interpolateNulls || seriesOptions.type === 'step') {
                thisPoint = isNullPoint ? prevPoint : {x:x, y:y};
            } else {
                thisPoint = isNullPoint ? null : {x:x, y:y};
            }

            if(isLineFilled) {
                if(prevPoint && !isNullPoint) {
                    var yZero = graph.height - graph.padding.bottom + graph.padding.top,
                        fillLineStartPath = "M" + prevPoint.x + " " + yZero
                            + "L" + prevPoint.x + " " + prevPoint.y
                            + "L" + prevPoint.x + " " + prevPoint.y
                            + "L" + prevPoint.x + " " + yZero,
                        fillLinePath = "M" + prevPoint.x + " " + yZero
                            + "L" + prevPoint.x + " " + prevPoint.y
                            + "L" + x + " " + y
                            + "L" + x + " " + yZero;

                    var fillLine = graph.paper.path(fillLineStartPath).attr({
                            'fill':color,
                            'stroke-width': 0,
                            'fill-opacity':graph.options.lines.fillOpacity,
                            'stroke' : 'transparent'
                        });

                    fillLine.animate({path: fillLinePath}, animSpeed);
                    fillLine.insertAfter(graph.grid.lines);
                }
            }


            function pointsAndLabels(){
                if (!isNullPoint) {
                    if (seriesOptions.showPoints) {
                        drawPoint(
                                x, y,
                                series[index].value,
                                color,
                                seriesOptions.fillPoints,
                                series[index].clickTarget,
                                seriesOptions.animatePoints,
                                seriesOptions.pointStroke);
                    }

                    if (seriesOptions.labelPoints) {
                        drawPointLabel(x, y, index, series[index].value, units, color);
                    }
                }
            }

            if(graph.options.animation) {
                line.animate({
                    path: currentPath + pathString
                }, animSpeed, function(){
                    pointsAndLabels();
                    drawLine({
                        series:series,
                        index:index + 1,
                        line:line,
                        prevPoint:thisPoint,
                        isLineFilled:isLineFilled,
                        color:color,
                        isLineStarted:isLineStarted,
                        currentPath:currentPath + pathString,
                        units:units
                        });
                });
            } else {
                line.attr('path', currentPath + pathString);
                pointsAndLabels();
                drawLine({
                    series:series,
                    index:index + 1,
                    line:line,
                    prevPoint:thisPoint,
                    isLineFilled:isLineFilled,
                    color:color,
                    isLineStarted:isLineStarted,
                    currentPath:currentPath + pathString,
                    units:units
                    });
            }

        }

        var currentHighlights = graph.paper.set(); // A set of raphael objects for highlighting hovers
        graph.$el.mouseleave(function(){
            currentHighlights.attr('opacity', 0);
        });

        /**
         * This will draw an invisible bar over the entire dataset for a given x-coordinate to serve as a target for the rollover
         * @param series A single series of data
         * @param {number} yTick The yTick scale for this data series
         * @param {Int} index The index of the x-label.  Used to draw the hover target area over one x-label for all series
         * @param seriesOptions Series options of the graph
         */
        function lineHover(series, yTick, index, seriesOptions) {

            var x = (index * graph.xTick + graph.padding.left) - (graph.xTick/2) + pointOffset,
                y = 0,
                pointsInSet = [],
                highlights = graph.paper.set();

            $(series).each(function(i){
                if (series[i][index].value || series[i][index].value === 0) {
                    pointsInSet.push(series[i][index].value);
                    var highlightX = index * graph.xTick + graph.padding.left + pointOffset;
                    var highlightY = graph.height - (series[i][index].value * yTick) - graph.padding.bottom + graph.padding.top;
                    var highlightCirc = graph.paper.circle(highlightX, highlightY, graph.options.lines.highlightRadius).attr({
                        'stroke': '#ccc',
                        'stroke-width': graph.options.lines.highlightStrokeWidth,
                        'opacity': 0
                    });

                    highlights.push(highlightCirc);
                }

            });
            var topPoint = Math.max.apply(Math, pointsInSet);
            topPoint = topPoint >= 0 ? topPoint : 0; // Pull the tooltip up to 0 if the usage is negative

            var errorHeight = graph.options.error ? graph.options.error.height + graph.options.error.top : 0,
                rollOverBar = graph.paper.rect(x, y + errorHeight, graph.xTick, graph.height-errorHeight).attr('fill', 'white').attr('opacity', 0);

            $(rollOverBar.node).bind('mouseenter focus', function(){

                if (graph.options.tooltip.show) {
                    var x = index * graph.xTick + graph.padding.left + pointOffset - graph.options.tooltip.width / 2;
                    var y = (topPoint * yTick) - graph.padding.top + graph.padding.bottom + graph.options.flagOffset + graph.options.lines.pointStrokeWidth + graph.options.lines.highlightRadius;

                    graph.$tooltip.stop().animate({
                        bottom: y,
                        left: x
                    }, 1, function(){
                        var tipContent = graph.options.tooltip.formatter(graph.tooltips[index], graph.options.messages);
                        graph.$tooltip.find('.elroi-tooltip-content').html(tipContent);
                    });
                }

                currentHighlights.attr('opacity', 0);
                highlights.attr('opacity', graph.options.lines.highlightOpacity);
                currentHighlights = highlights;

            });

            return rollOverBar;
        }

        /**
         * Draws all of the lines, points, and rollovers for a given data series
         */
        function drawAllLines() {
            var j;

            for(j=0; j< series.length; j++) {
                var color = graph.options.colors[j+seriesIndex],
                    line = graph.paper.path("M0 0").attr({
                        'stroke': color,
                        'stroke-width': graph.options.lines.width,
                        'opacity': graph.options.lines.opacity
                    });

                drawLine({
                    series:series[j],
                    line:line,
                    isLineFilled:graph.seriesOptions[seriesIndex].fillLines,
                    color:color,
                    units:graph.seriesOptions[seriesIndex].pointLabelUnits
                    });


            }

            var rollOvers = graph.paper.set();
            for(j=0; j< graph.numPoints; j++) {
                if (graph.tooltips && graph.tooltips[j]) {
                    rollOvers.push(lineHover(series, graph.yTicks[seriesIndex], j, graph.seriesOptions[seriesIndex]));
                }
            }
            rollOvers.toFront();
        }

        return {
            draw : drawAllLines
        };
    }

    elroi.fn.line = lines;
    elroi.fn.step = lines;

})(elroi);
(function(elroi, $) {

    /**
     * Draws a stacked bar graph for a given data series
     * @param graph The graph object defined in elroi
     * @param series The series of data
     * @param {int} seriesIndex The index of the pie graph data in the graph's allSeries array
     * @return wedges A set of all of the wedges
     * @return {function} draw The function to draw the pie graph
     */
    function pie(graph, series, seriesIndex) {

        var
            rad = Math.PI / 180,
            total = graph.sums[seriesIndex],
            center = {
                x : (graph.width + graph.padding.left - graph.padding.right)/2,
                y : (graph.height - graph.padding.bottom + graph.padding.top)/2
            },
            radius = (graph.height - graph.padding.bottom + graph.padding.top)/2,
            angle = 90,
            wedges = [],
            wedgeRobjs = graph.paper.set(),
            selectedWedge,
            FLAGMARGIN = 15,
            BUMPOUT = 15,
            flags;

        /**
         * Gets x and y coordinates for a given angle
         * @param cent The x and y coordinates of the center of the pie
         * @param r The radius of the pie
         * @param ang The angle of the desired coordinates
         * @return x and y coordinates at the desired angle
         */
        function getCoords(cent, r ,ang) {
            return {
                x : cent.x + r * Math.cos(-ang * rad),
                y : cent.y + r * Math.sin(-ang * rad)
            };
        }

        /**
         * Gets the x and y coordinates of a flag for a particulat wedge
         * @param {jQuery} $flag The flag that labels a given wedge
         * @param angle The angle of the wedge
         */
        function getFlagCoords($flag, angle){
            var flagCoords = getCoords(center, radius + FLAGMARGIN, angle);

            flagCoords.x -= $flag.width()/2;

            if(flagCoords.y < center.y) {
                flagCoords.y -= $flag.height()/2;
            }

            return flagCoords;
        }

        /**
         * Sorts the data series from largest to smallest
         * @param series The data to be sorted
         * @returns {Array} The sorted data series
         */
        function sortData(series){
            var sortedSeries = [];

            $(series).each(function(){
                sortedSeries.push(this.value);
            });
            return sortedSeries.sort(function(a,b){return b-a;});
        }

        /**
         * Gets the path string for a given wedge
         * @param middle The middle coordinates of the curve of the wedge
         * @param radius The radius of the pie
         * @param startCurve The beginning coordinates of the curve of the wedge
         * @param endCurve The end coordinates of the curve of the wedge
         * @returns {String} The path string of the wedge for use in Raphael
         */
        function getWedgePath(middle, radius, startCurve, endCurve) {
            return ["M", middle.x, middle.y, "L", startCurve.x, startCurve.y, "A", radius, radius, 0, 0, 1, endCurve.x, endCurve.y, "z"];
        }

        /**
         * Draws a wedge of the pie
         * @param {number} value The value of a particular pie segment
         * @param {int} sliceNum The index of this wedge relative to the full data set
         * @return {Raphael} wedge The raphael object for the wedge
         */
        function drawWedge(value, sliceNum){

            var startAngle = angle,
                endAngle = angle - 360 * value/total,

                startPoint = getCoords(center, radius, startAngle),
                endPoint = getCoords(center, radius, endAngle),
                path = getWedgePath(center, radius, startPoint, endPoint),

                animStartPoint = getCoords(center, BUMPOUT, startAngle + (endAngle - startAngle)/2),
                animStartCurvePoint = getCoords(animStartPoint, radius, startAngle),
                animEndCurvePoint = getCoords(animStartPoint, radius, endAngle),
                animPath = getWedgePath(animStartPoint, radius, animStartCurvePoint, animEndCurvePoint),

                $valFlag = $('<div>').addClass('elroi-point-flag').html(value);

            graph.$el.find('.paper').append($valFlag);

            var flagCoords = getFlagCoords($valFlag, startAngle + (endAngle - startAngle)/2);
            $valFlag.css({left: flagCoords.x, top: flagCoords.y});

            angle = endAngle;

            var rObj = graph.paper.path(path).attr({
                'fill': graph.options.colors[sliceNum % graph.options.colors.length],
                'stroke-width': 0
            });

            var wedge =  {
                startAngle : startAngle,
                endAngle: endAngle,
                rObj: rObj,
                flag : {
                    $el : $valFlag,
                    coords : flagCoords
                },
                path: path,
                animPath: animPath
            };

            return wedge;
        }

        /**
         * Rotates the graph and highlights a particular wedge
         * @param {Raphael} wedge The clicked wedge object
         */
        function selectWedge(wedge) {

            var rotationAngle = wedge.startAngle - Math.abs((wedge.endAngle - wedge.startAngle)/2),
                flagCoords = {},
				selectedFlagOffset = wedge.flag.$el.width()/2,
				selectedFlagCoords = {};

            $(wedges).each(function(i){
                flagCoords = getFlagCoords(this.flag.$el, wedges[i].startAngle + (wedges[i].endAngle - wedges[i].startAngle)/2 - rotationAngle);
                if(graph.options.animation) {
					flags.fadeOut(40);
				} else{
					flags.hide();
				}
                wedges[i].flag.$el.css({left: flagCoords.x, top: flagCoords.y });
            });


			if(graph.options.animation) {
            	selectedWedge.rObj.animate(
	                {
	                    path: selectedWedge.path
	                },
	                25,
	                function(){
	                    wedgeRobjs.animate(
	                        {
	                            'rotation': rotationAngle + ' ' + center.x + ' ' + center.y,
	                            'stroke-width': 0
	                        },
	                        500,
	                        function(){

	                            flags.fadeIn();
								wedge.flag.$el.css('left', wedge.flag.$el.position().left + selectedFlagOffset + FLAGMARGIN);

	                            wedge.rObj.animate({
	                                path: wedge.animPath
	                            }, 100);
	                        }
	                    );
	                }
	            );
			} else {
				selectedWedge.rObj.attr('path', selectedWedge.path);
				wedgeRobjs.attr({'rotation': rotationAngle + ' ' + center.x + ' ' + center.y});
				wedge.rObj.attr({'path': wedge.animPath});
				flags.show();
				wedge.flag.$el.css('left', wedge.flag.$el.position().left + selectedFlagOffset + FLAGMARGIN);
			}

            selectedWedge = wedge;
        }

        /**
         * Draws a pie graph, and attaches click behavior to each wedge
         */
        function drawPie(){

            $(series).each(function(i){
                var singleSeries = sortData(series[i]);

                if(singleSeries.length > 1) {

                    $(singleSeries).each(function(j){
                        var wedge = drawWedge(singleSeries[j], j);
                        wedges.push(wedge);
                        wedgeRobjs.push(wedge.rObj);
                    });

                }
                else {
                    graph.paper.circle(center.x, center.y, radius).attr('fill', graph.options.colors[0]);
                }
            });

            flags = graph.$el.find('.elroi-point-flag');
            flags.hide();

            selectedWedge = wedges[0];
            if(graph.options.animation) {
            	wedgeRobjs.attr({opacity: 0});
				wedgeRobjs.animate({ opacity: 1}, 300, function(){ selectWedge(selectedWedge); });
			} else {
				selectWedge(selectedWedge);
			}

            $(wedges).each(function(i){

                var wedge = this;

                wedge.rObj.click(function(){
                    selectWedge(wedge);
                });

            });

        }

        return {
            wedges : wedges,
            draw : drawPie
        };
    }

    elroi.fn.pie = pie;

})(elroi, jQuery);
(function(elroi, $) {

    /**
     * Draws a stacked bar graph for a given data series
     * @param graph The graph object defined in elroi
     * @param series The series of data
     * @param {int} seriesIndex The index of the stacked bar data in the graph's allSeries array
     */
    function bars(graph, series, seriesIndex) {

        var barWidth = graph.barWidth + graph.options.bars.highlightBorderWidth;

         /**
         * Draws the bars for a single series of data
         * @param {series} series The single series
         * @param {Array} seriesSum A sum of the values of the data series graphed so far
         * @param {int} seriesCount The count of the data series currently being graphed
         * @param {number} yTick The y-scale of the data
         * @param {number} barWidth The width of the bar to be drawn
         * @param {String} color The color of the bar
         * @return {Array} seriesSum The updated series sum array
         */
        function drawStackedBar(series, seriesSum, seriesCount, yTick, color) {

            $(series).each(function(i) {

                if(series[i].value || series[i].value === 0 || series[i].pointFlag) {
                    var x = i * graph.xTick + graph.padding.left + (graph.barWhiteSpace/2),
                        barHeight = series[i].value * yTick,
                        y = graph.height - barHeight - (seriesSum[i] * yTick) - graph.padding.bottom + graph.padding.top,
                        barStartHeight = graph.options.animation ? 0 : barHeight,
                        barStartY = graph.height-graph.padding.bottom+graph.padding.top,
                        bar;
                    barStartY = graph.options.animation ? barStartY : y;

                    bar = graph.paper.rect(x, barStartY, barWidth, barStartHeight).attr('fill', color).attr('stroke', color);

                    if(graph.options.animation){
                        bar.animate({y:y, height: barHeight}, 550, function(){
                            $(graph.$el).trigger('barDrawn');
                        });
                    } else {
                        $(graph.$el).trigger('barDrawn');
                    }
                }

                seriesSum[i] += series[i].value;
            });

            return seriesSum;

        }

        /**
         * Draws flags above the bars
         * @param series The data series to add flags to
         * @param {int} seriesSum
         * @param {int} seriesCount The 1-based index of the series relative to the entire data set
         * @param {number} yTick The yTick scale
         */
        function drawPointFlags(series, seriesSum, seriesCount, yTick) {
             $(series).each(function(i) {

                if(series[i].value || series[i].value === 0 || series[i].pointFlag) {
                    var x = i * graph.xTick + graph.padding.left + (graph.barWhiteSpace/2);
                    var totalBarHeights = seriesSum[i] * yTick;
                    var y = graph.height - totalBarHeights - graph.padding.bottom + graph.padding.top;

                    if (series[i].pointFlag && (seriesCount == graph.allSeries[0].series.length)) {
                            var $pointFlag = series[i].pointFlag;
                            $pointFlag.addClass('elroi-point-flag').appendTo(graph.$el.find('.paper'));

                            var pointFlagY;
                            if (graph.options.bars.flagPosition == 'interior' && $pointFlag.outerHeight() < totalBarHeights) {
                                pointFlagY = graph.height - y - $pointFlag.outerHeight() - graph.options.flagOffset;
                            }
                            else {
                                pointFlagY = graph.height - y + graph.options.flagOffset;
                            }

                            $pointFlag.css({
                                bottom: pointFlagY,
                                left: x + barWidth / 2 - $pointFlag.outerWidth() / 2
                            }).hide();
                        }
                }
            });

        }

        /**
         * This will draw an invisible bar over all stacked bars for a given x-coordinate to serve as a target for the rollover
         * @param {series} series - The entire data set for the stacked bar graph
         * @param {number} yTick The y-scale of the graph
         * @param {int} index The index of the x-label.  Used to draw the hover target area over one x-label for all series
         */
        function barHover(series, yTick, index, isStacked) {

            var total = 0,
                clickTarget;
            if(isStacked) {
                $(series).each(function(i) {
                    total += series[i][index].value;
                    if(series[i][index].clickTarget){
                        clickTarget = series[i][index].clickTarget;
                    }
                });
            } else {
                var set = [];
                $(series).each(function(i) {
                    set.push(series[i][index].value);
                });
                total = Math.max.apply(Math, set);
            }
            var barHeight;
            var x = index * graph.xTick + graph.padding.left - (graph.options.bars.highlightBorderWidth/2) + (graph.barWhiteSpace/2);
            var y;

            var rolloverBars = graph.paper.set();
            var rolloverX;
            for(var i = 0; i < series.length; i++) {

                barHeight = isStacked ? (total * yTick) + graph.options.bars.highlightBorderWidth :
                    series[i][index].value * yTick + graph.options.bars.highlightBorderWidth;
                y = graph.height - barHeight - graph.padding.bottom + graph.padding.top + (graph.options.bars.highlightBorderWidth/2);

                rolloverX = isStacked ? x : x + barWidth * i;
                var rollOverBar = graph.paper
                        .rect(rolloverX, y, barWidth, barHeight)
                        .attr({
                            'fill': 'white',
                            'fill-opacity': 0.1,
                            'stroke': graph.options.bars.highlightColor,
                            'stroke-width': 4,
                            'stroke-opacity': 0
                        });
                rolloverBars.push(rollOverBar);
                var targetBarWidth = isStacked ? barWidth : barWidth * series.length
                var rollOverTargetBar = graph.paper
                        .rect(x, 0, targetBarWidth, graph.height)
                        .attr({
                            'fill': 'white',
                            'fill-opacity': 0,
                            'stroke-width' : 0,
                            'stroke' : 'none'
                        });
            }

            var tallestBarHeight = isStacked ? barHeight : total * yTick + graph.options.bars.highlightBorderWidth;
            $(rollOverTargetBar.node).hover(
                function() {
                    rolloverBars.attr('stroke-opacity', graph.options.bars.highlightBorderOpacity);
                    if (graph.options.tooltip.show) {
                        var tipX = x + barWidth / 2 - graph.options.tooltip.width / 2;
                        var tipY = tallestBarHeight + graph.options.flagOffset + graph.options.bars.highlightBorderWidth;
                        graph.$tooltip.stop().animate({bottom: tipY, left:tipX }, 1, function() {
                            var tipContent = graph.options.tooltip.formatter(graph.tooltips[index], graph.options.messages);
                            graph.$tooltip.find('.elroi-tooltip-content').html(tipContent);
                        });

                    }
                },
                function() {
                    rolloverBars.attr('stroke-opacity', 0);
                });

            $(rollOverTargetBar.node).click(function(){
                if (clickTarget) {
                    document.location = clickTarget;
                }
            });

            if (clickTarget) {
                $(rollOverTargetBar.node).hover(
                    function() {
                        rollOverTargetBar.node.style.cursor = "pointer";
                    },
                    function() {
                        rollOverTargetBar.node.style.cursor = "";
                    }
                );
            }

        }

        function drawBar(bar, barIndex, seriesIndex, yTick, color) {

            var x = barIndex * graph.xTick + barWidth * seriesIndex + graph.padding.left + (graph.barWhiteSpace/2),
                barHeight = bar.value * yTick,
                y = graph.height - barHeight - graph.padding.bottom + graph.padding.top,
                barStartHeight = graph.options.animation ? 0 : barHeight,
                barStartY = graph.height-graph.padding.bottom+graph.padding.top,
                bar;
            barStartY = graph.options.animation ? barStartY : y;

            bar = graph.paper.rect(x, barStartY, barWidth, barStartHeight).attr('fill', color).attr('stroke', color);
            if(graph.options.animation){
                bar.animate({y:y, height: barHeight}, 550, function(){
                    $(graph.$el).trigger('barDrawn');
                });
            } else {
                $(graph.$el).trigger('barDrawn');
            }
        }

        /**
         * Draws the stacked bars on the graph
         */
        function drawBars() {
            var isStacked = graph.allSeries[seriesIndex].options.type ==='stackedBar',
                seriesSum = [],
                color,
                i=0,
                j = 0;

            if(isStacked) {
                for (j = 0; j < graph.numPoints; j++) {
                    seriesSum.push(0);
                }
                for (j = 0; j < series.length; j++) {
                    color = graph.options.colors[j];
                    seriesSum = drawStackedBar(series[j], seriesSum, j+1, graph.yTicks[seriesIndex], color);
                }
            } else {
                barWidth = barWidth/series.length;

                for (i = 0; i < graph.numPoints; i++) {
                    for(j=0; j < series.length; j++) {
                        color = graph.options.colors[j];
                        drawBar(series[j][i], i, j, graph.yTicks[seriesIndex], color);
                    }
                }
            }

            graph.$el.bind('barDrawn', function(){$('.point-flag').fadeIn();});
            for (j = 0; j < series.length; j++) {
                drawPointFlags(series[j], seriesSum, j+1, graph.yTicks[seriesIndex]);
            }

            if (graph.tooltips && graph.tooltips.length) {
                for (j = 0; j < graph.numPoints; j++) {
                    if (graph.tooltips[j] || graph.tooltips[j] === 0) {
                        barHover(series, graph.yTicks[seriesIndex], j, isStacked);
                    }
                }
            }

        }

        return {
            draw : drawBars
        };
    }

    elroi.fn.stackedBar = bars;
    elroi.fn.bar = bars;

})(elroi, jQuery);
