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
                    // Scrape out duplicate months or years from startDate and endDate
                    if (startDate.getMonth() == endDate.getMonth()) {
                        endDateFormat = endDateFormat.replace('M', '' && startDateFormat.match('M'));
                    }
                    if (startDate.getFullYear() == endDate.getFullYear() && startDateFormat.match(', yy')) {
                        startDateFormat = startDateFormat.replace(', yy', '');
                    }
                }

                if (this.startDate) {
                    label += $.datepicker.formatDate(startDateFormat, startDate);
                }
                if(this.startDate && this.endDate) {
                    label += " &ndash;";
                }
                if(this.endDate) {
                    label += $.datepicker.formatDate(endDateFormat, endDate);
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
            //draw the gridlines
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


            // Get those labels centered relative to their bar
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

            // Draw the y labels
            var $yLabels = $('<ul></ul>')
                    .addClass("y-ticks")
                    .addClass(axis.id);

            var precision = 0,
                yLabels = getYLabels(maxVal, minVal, precision),
                avalaibleArea = graph.height - graph.padding.top - graph.padding.bottom;

            while(ei.utils.array.containsDupes(yLabels)) {
                precision++;
                yLabels = getYLabels(maxVal, minVal, precision);
            }

            $(yLabels).each(function(i){
                var yLabel = ei.utils.number.commaFormat(yLabels[i], precision);

                var y = graph.height
                        - i / (graph.options.grid.numYLabels - 1) * avalaibleArea
                        - graph.padding.bottom
                        + graph.padding.top
                        - graph.labelLineHeight;

                // Topmost ylabel gets a different unit
                if(i === graph.options.grid.numYLabels-1) {
                    yLabel = (axis.prefixUnit ? axis.topUnit : '')
                            + yLabel
                            + (!axis.prefixUnit ? " " + axis.topUnit : '');
                } else {
                    yLabel = (axis.prefixUnit ? axis.unit : '')
                            + yLabel
                            + (!axis.prefixUnit ? " " + axis.unit : '');
                }

                // y1 labels go on the left, y2 labels go on the right
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

            // Can't get any axes if we don't have any data
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

    elroi.fn.grid = grid;

})(elroi, jQuery);
