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

                $valFlag = $('<div>').addClass('point-flag').html(value);

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
                flagCoords = {};

            $(wedges).each(function(i){
                flagCoords = getFlagCoords(this.flag.$el, wedges[i].startAngle + (wedges[i].endAngle - wedges[i].startAngle)/2 - rotationAngle);
                flags.fadeOut(40);
                wedges[i].flag.$el.css({left: flagCoords.x, top: flagCoords.y });
            });

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

                            wedge.rObj.animate({
                                path: wedge.animPath
                            }, 100);
                        }
                    );
                }
            );

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
                    // There is only one thing to graph; just make a circle
                    graph.paper.circle(center.x, center.y, radius).attr('fill', graph.options.colors[0]);
                }
            });

            flags = graph.$el.find('.point-flag');
            flags.hide();

            selectedWedge = wedges[0];
            wedgeRobjs.attr({opacity: 0});
            wedgeRobjs.animate({ opacity: 1}, 300, function(){ selectWedge(selectedWedge); });

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
