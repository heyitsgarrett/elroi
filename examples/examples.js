$(document).ready(function(){
   var $container = $('.graph');
   var series1 = [
       [
           {value: 683, endDate: "2009-05-01T03:59:59.000Z"},
           {value: 689, endDate: "2009-06-01T03:59:59.000Z"},
           {value: 708, endDate: "2009-07-01T03:59:59.000Z"},
           {value: 680, endDate: "2009-08-01T03:59:59.000Z"},
           {value: 540, endDate: "2009-09-01T03:59:59.000Z"},
           {value: 682, endDate: "2009-10-01T03:59:59.000Z"},
           {value: 685, endDate: "2009-11-01T03:59:59.000Z"},
           {value: 707, endDate: "2009-12-01T04:59:59.000Z"},
           {value: 702, endDate: "2010-01-01T04:59:59.000Z"},
           {value: 653, endDate: "2010-02-01T04:59:59.000Z"},
           {value: 748, endDate: "2010-03-01T04:59:59.000Z"},
           {value: 748, endDate: "2010-04-01T03:59:59.000Z"}
       ],
       [
           {value: 383, endDate: "2009-05-01T03:59:59.000Z"},
           {value: 289, endDate: "2009-06-01T03:59:59.000Z"},
           {value: 208, endDate: "2009-07-01T03:59:59.000Z"},
           {value: 380, endDate: "2009-08-01T03:59:59.000Z"},
           {value: 490, endDate: "2009-09-01T03:59:59.000Z"},
           {value: 282, endDate: "2009-10-01T03:59:59.000Z"},
           {value: 385, endDate: "2009-11-01T03:59:59.000Z"},
           {value: 507, endDate: "2009-12-01T04:59:59.000Z"},
           {value: 802, endDate: "2010-01-01T04:59:59.000Z"},
           {value: 453, endDate: "2010-02-01T04:59:59.000Z"},
           {value: 348, endDate: "2010-03-01T04:59:59.000Z"},
           {value: 248, endDate: "2010-04-01T03:59:59.000Z"}
       ]
   ];
   var series2 = [
       [
           {value: 483, endDate: "2009-05-01T03:59:59.000Z"},
           {value: 289, endDate: "2009-06-01T03:59:59.000Z"},
           {value: 308, endDate: "2009-07-01T03:59:59.000Z"},
           {value: 480, endDate: "2009-08-01T03:59:59.000Z"},
           {value: 340, endDate: "2009-09-01T03:59:59.000Z"},
           {value: 482, endDate: "2009-10-01T03:59:59.000Z"},
           {value: 485, endDate: "2009-11-01T03:59:59.000Z"},
           {value: 207, endDate: "2009-12-01T04:59:59.000Z"},
           {value: 202, endDate: "2010-01-01T04:59:59.000Z"},
           {value: 353, endDate: "2010-02-01T04:59:59.000Z"},
           {value: 348, endDate: "2010-03-01T04:59:59.000Z"},
           {value: 448, endDate: "2010-04-01T03:59:59.000Z"}
       ],
       [
           {value: 83, endDate: "2009-05-01T03:59:59.000Z"},
           {value: 89, endDate: "2009-06-01T03:59:59.000Z"},
           {value: 8, endDate: "2009-07-01T03:59:59.000Z"},
           {value: 80, endDate: "2009-08-01T03:59:59.000Z"},
           {value: 90, endDate: "2009-09-01T03:59:59.000Z"},
           {value: 82, endDate: "2009-10-01T03:59:59.000Z"},
           {value: 85, endDate: "2009-11-01T03:59:59.000Z"},
           {value: 7, endDate: "2009-12-01T04:59:59.000Z"},
           {value: 2, endDate: "2010-01-01T04:59:59.000Z"},
           {value: 53, endDate: "2010-02-01T04:59:59.000Z"},
           {value: 48, endDate: "2010-03-01T04:59:59.000Z"},
           {value: 48, endDate: "2010-04-01T03:59:59.000Z"}
       ]
   ];
   var tooltips = ['tip 1', 'tip 2', 'tip 3', 'tip 4', 'tip 5', 'tip 6', 'tip 7', 'tip 8', 'tip', 'tip', 'tip', 'tip'];
   var tipFormat = function(tip) {
       var formatted = '<p>' + tip + '</p>';
     return  formatted; 
   };
   
   function buildGraphOpts() {
       var graphOpts = {};
       
       var $form = $('#options-form');
       
       // top level
       graphOpts.animation = $('#animation').is(':checked');
       graphOpts.labelDateFormat = $('#label-date-format').val();
       graphOpts.errorMessage = $('#error-message').val() == '' ? false : "<p>" + $('#error-message').val() + '</p>';
       graphOpts.labelWidth = $('#label-width').val();
       
       // grid
       graphOpts.grid = {
         show:  $('#show-grid').is(':checked'),
         showBaseline: $('#show-baseline').is(':checked'),
         numYLabels: $('#num-y-labels').val() == '' ? 0 : parseInt($('#num-y-labels').val(), 0)
       };
       
       //tooltips
       graphOpts.tooltip = {
           show:  $('#show-tooltips').is(':checked')
       };
       
       // axes
       graphOpts.axes = {
          x1 :{
              show:  $('#x1-show').is(':checked'),
          },
          x2 :{
              show:  $('#x2-show').is(':checked'),
          },
          y1 :{
               show:  $('#y1-show').is(':checked'),
               unit: $('#y1-unit').val(),
               topUnit: $('#y1-top-unit').val(),
               prefixUnit:  $('#y1-prefix-unit').is(':checked'),
               seriesIndex: $('#y1-series-index').val()
          },
          y2 :{
              show:  $('#y2-show').is(':checked'), 
              unit: $('#y2-unit').val(),
              topUnit: $('#y2-top-unit').val(),
              prefixUnit:  $('#y2-prefix-unit').is(':checked'),
              seriesIndex: $('#y2-series-index').val()
          }
           
           
       };
       return graphOpts;
   }
   
   function buildSeriesOptions(seriesId) {
       var seriesOpts = {};
       seriesOpts.type = $('#' + seriesId + '-type').val();
       seriesOpts.showPoints = $('#' + seriesId + '-show-points').is(':checked');
       seriesOpts.fillPoints = $('#' + seriesId + '-fill-points').is(':checked');
       seriesOpts.labelPoints = $('#' + seriesId + '-label-points').is(':checked');
       seriesOpts.animatePoints = $('#' + seriesId + '-animate-points').is(':checked');
       seriesOpts.pointStroke = $('#' + seriesId + '-point-stroke').is(':checked');      
       seriesOpts.interpolateNulls = $('#' + seriesId + '-interpolate-nulls').is(':checked');
       return seriesOpts;
   }
   
   function showCode(graphOpts, series1Opts, series2Opts){
       var series1String = JSON.stringify(series1);
       var series2String = JSON.stringify(series2);
       var graphOptsString = JSON.stringify(graphOpts);
       var series1OptsString = JSON.stringify(series1Opts);
       var series2OptsString = JSON.stringify(series2Opts);
       var elroiCallRaw, prettySeries1, prettySeries2, prettyCall;

       series1String = "var series1 = " + series1String + ";";
       series2String = "var series2 = " + series2String + ";";
       
       elroiCallRaw = "var myGraph = elroi($container, [{series:series1, options: ";
       elroiCallRaw += series1OptsString += "},{series:series2, options: " + series2OptsString;
       elroiCallRaw += "}], " + graphOptsString + "});";
       
       prettyElroiCall = js_beautify(elroiCallRaw);
       prettySeries1 = js_beautify(series1String);
       prettySeries2 = js_beautify(series2String);
       
       $("#elroi-call").text(prettyElroiCall);
       $("#series-1-code").text(prettySeries1);
       $("#series-2-code").text(prettySeries2);
   }
   
   function drawGraph() {
       $container.children().remove();
       var graphOptions = buildGraphOpts();
       var series1Opts = buildSeriesOptions('series-1');
       var series2Opts = buildSeriesOptions('series-2');
       var elroiSample = elroi(
            $container, 
            [
                    {series:series1, options: series1Opts},
                    {series:series2, options: series2Opts}
                 ],
                 graphOptions
           );
        showCode(graphOptions, series1Opts, series2Opts);
    }
    drawGraph();
   
   $('#the-code').find('pre:not(#elroi-call)').hide();
   $('#the-code a').click(function(e){
       e.preventDefault();
       var targetBlock = $($(this).attr('href'));
       $('#the-code').find('pre').hide();
       $('#the-code').find('li').removeClass('selected');
       $(this).parents('li').addClass('selected');
       targetBlock.show();
   });
        
   $('#options-form input, #options-form select, #series-opts-form input, #series-opts-form select').change(drawGraph);
});