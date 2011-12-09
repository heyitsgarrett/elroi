$(document).ready(function(){
   var $container = $('.graph');
  
   var allSeriesData = [];
   var allSeriesOpts = [];
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
       seriesOpts.type = $('#series-' + seriesId + '-type').val();
       seriesOpts.showPoints = $('#series-' + seriesId + '-show-points').is(':checked');
       seriesOpts.fillPoints = $('#series-' + seriesId + '-fill-points').is(':checked');
       seriesOpts.labelPoints = $('#series-' + seriesId + '-label-points').is(':checked');
       seriesOpts.animatePoints = $('#series-' + seriesId + '-animate-points').is(':checked');
       seriesOpts.pointStroke = $('#series-' + seriesId + '-point-stroke').is(':checked');      
       seriesOpts.interpolateNulls = $('#series-' + seriesId + '-interpolate-nulls').is(':checked');
       
       allSeriesOpts[seriesId-1] = seriesOpts;
       
       return seriesOpts;
   }
   
   function buildSeriesData(seriesId) {
       var series = [], subseries, dataPoint;
       
       var numSubSeries = parseInt($('#series-' + seriesId + '-num-subseries').val(), 10),
            numPoints = parseInt($('#series-' + seriesId + '-num-points').val(), 10),
            startDate = Date.parse($('#series-' + seriesId + '-start-date').val()),
            timeBetweenNum = parseInt($('#series-' + seriesId + '-time-between-num').val(), 10),
            timeBetweenUnits = $('#series-' + seriesId + '-time-between-unit').val(),
            dateMultiplier;
            
      switch(timeBetweenUnits) {
          case "hours":
            dateMultiplier = 1000 * 60 * 60;
            break;
          case "days":
            dateMultiplier = 1000 * 60 * 60 * 24;
            break;
      }
       
       for(var i = 0; i < numSubSeries; i++) {
           subseries = [];
           for(var j=0; j < numPoints; j++) {
               dataPoint = {
                 value: Math.floor(Math.random()*101),
                 date: startDate + j * dateMultiplier   
               };
               subseries.push(dataPoint);
           }
           series.push(subseries);
       }
       
       allSeriesData[seriesId - 1] = series;
       return series;
   }
   
   function showCode(graphOpts){
      
       var graphOptsString = JSON.stringify(graphOpts);
       var seriesString,
        prettySeriesString,
        seriesOptsString,
        seriesDisplayNum,
        prettyElroiCall,
        elroiCallString = "var myGraph = elroi($container, [";
       
       for(var i = 0; i < allSeriesData.length; i++) {
           seriesDisplayNum = i+1;
           seriesString = JSON.stringify(allSeriesData[i]);
           seriesOptsString = JSON.stringify(allSeriesOpts[i])
           elroiCallString += "{ series: " + seriesString + ", options: " + seriesOptsString;
           
           if(i !== allSeriesData.length - 1) {
               elroiCallString += "}, ";
           } else {
               elroiCallString += "}";
           }
       }
       elroiCallString += "], " + graphOptsString + ");";
       
       prettyElroiCall = js_beautify(elroiCallString);
       
       $("#elroi-call").text(prettyElroiCall);
   }
   
   function addASeries(){
       var $seriesForms = $("#series-opts-form");
       var num = $seriesForms.find('fieldset').length + 1;
       var template = $('#series-1-fieldset').html();
       template = template.replace(/series-1/g, 'series-' + num);
       
       $('<fieldset />').addClass('clearfix').html(template).insertBefore($('#add-series').parent());
       drawGraph();
   }
   
   function drawGraph() {
       $container.children().remove();
       var graphData = [];
       $('#series-opts-form fieldset').each(function(i){
           var seriesNum = i+1;
           var seriesOpts = buildSeriesOptions(seriesNum);
           var seriesData = buildSeriesData(seriesNum);
           graphData.push({series:seriesData, options: seriesOpts});
       });
       var graphOptions = buildGraphOpts();
       var elroiSample = elroi(
            $container, 
            graphData,
            graphOptions
           );
        showCode(graphOptions);
    }
    drawGraph();
    
   $('#add-series').click(function(e){
       e.preventDefault();
       addASeries();
   });
   $('#series-opts-form').submit(function(e){
      e.preventDefault(); 
   });
        
   $('#options-form input, #options-form select, #series-opts-form input, #series-opts-form select').live('change',drawGraph);
});