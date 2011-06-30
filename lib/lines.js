(function(elroi){

    /**
     * Creates a line graph for a particulary series of data
     * @param {graph} graph The graph object defined in elroi
     * @param {series} series The series to graph as a line graph
     * @param {int} seriesIndex The index of this series
     * @return {function} draw Draws the line on the graph
     */
    function lines(graph, series, seriesIndex){

        // points on the graph are centered horizontally relative to their labels
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
         */
        function drawPoint(x, y, value, color, fillPoint, clickTarget){

            // Draw the point
            var point = graph.paper.circle(x, y, 0).attr({
                'stroke': color,
                'stroke-width': graph.options.lines.pointStrokeWidth,
                'fill': '#fff'
            });

            if(fillPoint) {
                point.attr({fill: color});
            }

            point.animate({r:graph.options.lines.pointRadius}, 500, 'bounce');

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


            // End recursion once you've hit the last point
            if(index == series.length) {
                return true;
            }

            var isNullPoint = !(series[index].value || series[index].value === 0);

            var x = index * graph.xTick + graph.padding.left + pointOffset,
                y = graph.height - ((series[index].value - seriesOptions.minYValue) * yTick) - graph.padding.bottom + graph.padding.top,
                pathString = "",
                animSpeed = (window.isIE6 ? 1 : 800)/series.length,
                isFirstPoint = !index;

            // If we aren't interpolating nulls, don't draw from the previous null point
            if(!prevPoint && !seriesOptions.interpolateNulls) {
                isLineStarted = false;
            }

            // If the startpoint is at the left edge, pick up the pen and move there.  Otherwise, draw, skipping null points
            if (!isFirstPoint && isLineStarted && !isNullPoint) {
                pathString = "L" + x + " " + y;
            } else if (isNullPoint && !isFirstPoint){
                pathString = "";
            }
            else {
                pathString = "M" + x + " " + y;

            }

            // The line is started once we hit our first non-null point
            if(!isLineStarted && !isNullPoint) {
                isLineStarted = true;
            }

            var thisPoint;
            if(seriesOptions.interpolateNulls) {
                thisPoint = isNullPoint ? prevPoint : {x:x, y:y};
            } else {
                thisPoint = isNullPoint ? null : {x:x, y:y};
            }

            if(isLineFilled) {
            // Fill in this segment if there aren't nulls
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

            line.animate({
                path: currentPath + pathString
            }, animSpeed, function(){
                if (!isNullPoint) {
                    if (seriesOptions.showPoints) {
                        drawPoint(x, y, series[index].value, color, seriesOptions.fillPoints, series[index].clickTarget);
                    }
                    else {
                        graph.paper.circle(x, y, graph.options.lines.width).attr({
                            stroke: 'none',
                            'fill': color
                        });
                    }

                    if (seriesOptions.labelPoints) {
                        drawPointLabel(x, y, index, series[index].value, units, color);
                    }
                }

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

        }

        var currentHighlights = graph.paper.set(); // A set of raphael objects for highlighting hovers
        graph.$el.mouseleave(function(){
            // Hide the highlights if the mouse leaves the graph
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
                // skip any null points
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

                // Show the tooltip
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

            // Add rollovers
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

})(elroi);
