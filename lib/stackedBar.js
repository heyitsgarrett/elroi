(function(elroi, $) {

    /**
     * Draws a stacked bar graph for a given data series
     * @param graph The graph object defined in elroi
     * @param series The series of data
     * @param {int} seriesIndex The index of the stacked bar data in the graph's allSeries array
     */
    function stackedBars(graph, series, seriesIndex) {

        // If the bar width is not defined, set it automatically
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
                    var x = i * graph.xTick + graph.padding.left + (graph.barWhiteSpace/2);
                    var barHeight = series[i].value * yTick;
                    var y = graph.height - barHeight - (seriesSum[i] * yTick) - graph.padding.bottom + graph.padding.top;

                    var bar = graph.paper.rect(x, graph.height-graph.padding.bottom+graph.padding.top, barWidth, 0).attr('fill', color).attr('stroke', color);

                    bar.animate({y:y, height: barHeight}, 550, function(){
                        $(graph.$el).trigger('barDrawn');
                    });
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
                            $pointFlag.addClass('point-flag png-fix').appendTo(graph.$el.find('.paper'));

                            // Show the labels inside the bars
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
        function barHover(series, yTick, index) {

            var total = 0,
                clickTarget;

            $(series).each(function(i) {

                total += series[i][index].value;
                if(series[i][index].clickTarget){
                    clickTarget = series[i][index].clickTarget;
                }
            });
            var barHeight = (total * yTick) + graph.options.bars.highlightBorderWidth;

            var x = index * graph.xTick + graph.padding.left - (graph.options.bars.highlightBorderWidth/2) + (graph.barWhiteSpace/2);
            var y = graph.height - barHeight - graph.padding.bottom + graph.padding.top + (graph.options.bars.highlightBorderWidth/2);

            var rollOverBar = graph.paper
                    .rect(x, y, barWidth, barHeight)
                    .attr({
                        'fill': 'white',
                        'fill-opacity': 0.1,
                        'stroke': graph.options.bars.highlightColor,
                        'stroke-width': 4,
                        'stroke-opacity': 0
                    });
            var rollOverTargetBar = graph.paper
                    .rect(x, 0, barWidth, graph.height)
                    .attr({
                        'fill': 'white',
                        'fill-opacity': 0,
                        'stroke-width' : 0,
                        'stroke' : 'transparent'
                    });

            $(rollOverTargetBar.node).hover(
                function() {

                    rollOverBar.attr('stroke-opacity', graph.options.bars.highlightBorderOpacity);
                    if (graph.options.tooltip.show) {

                        var tipX = x + barWidth / 2 - graph.options.tooltip.width / 2;
                        var tipY = barHeight + graph.options.flagOffset + graph.options.bars.highlightBorderWidth;
                        graph.$tooltip.stop().animate({bottom: tipY, left:tipX }, 1, function() {
                            var tipContent = graph.options.tooltip.formatter(graph.tooltips[index], graph.options.messages);
                            graph.$tooltip.find('.tooltip-content').html(tipContent);
                        });

                    }
                },
                function() {
                    rollOverBar.attr('stroke-opacity', 0);
                });

            // Attach the click behavior, if we have a target
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

        /**
         * Draws the stacked bars on the graph
         */
        function drawStackedBars() {
            var seriesSum = [],
                 j = 0;

            for (j = 0; j < graph.numPoints; j++) {
                seriesSum.push(0);
            }
            for (j = 0; j < series.length; j++) {
                var color = graph.options.colors[j];
                seriesSum = drawStackedBar(series[j], seriesSum, j+1, graph.yTicks[seriesIndex], color);
            }

            // draw in the point flags
            graph.$el.bind('barDrawn', function(){$('.point-flag').fadeIn();});
            for (j = 0; j < series.length; j++) {
                drawPointFlags(series[j], seriesSum, j+1, graph.yTicks[seriesIndex]);
            }

            if (graph.tooltips && graph.tooltips.length)
            {
                for (j = 0; j < graph.numPoints; j++) {
                    if (graph.tooltips[j] || graph.tooltips[j] === 0) {
                        barHover(series, graph.yTicks[seriesIndex], j);
                    }
                }
            }

        }

        return {
            draw : drawStackedBars
        };
    }

    elroi.fn.stackedBar = stackedBars;

})(elroi, jQuery);
