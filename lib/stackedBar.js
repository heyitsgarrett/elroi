(function(elroi, $) {

    /**
     * Draws a stacked bar graph for a given data series
     * @param graph The graph object defined in elroi
     * @param series The series of data
     * @param {int} seriesIndex The index of the stacked bar data in the graph's allSeries array
     */
    function bars(graph, series, seriesIndex) {

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
                            $pointFlag.addClass('elroi-point-flag').appendTo(graph.$el.find('.paper'));

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
        
        function drawBar(bar, barIndex, seriesIndex, yTick, color) {
            
            var x = barIndex * graph.xTick + barWidth * seriesIndex + graph.padding.left + (graph.barWhiteSpace/2),
                barHeight = bar.value * yTick,
                y = graph.height - barHeight - graph.padding.bottom + graph.padding.top;

            var bar = graph.paper.rect(x, graph.height-graph.padding.bottom+graph.padding.top, barWidth, 0).attr('fill', color).attr('stroke', color);

            bar.animate({y:y, height: barHeight}, 550, function(){
                $(graph.$el).trigger('barDrawn');
            });
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
                // This isn't a stacked bar; change up the bar width
                barWidth = barWidth/series.length;
                
                for (i = 0; i < graph.numPoints; i++) {
                    for(j=0; j < series.length; j++) {
                        color = graph.options.colors[j];
                        drawBar(series[j][i], i, j, graph.yTicks[seriesIndex], color);
                    }
                }
            }

            // draw in the point flags
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
