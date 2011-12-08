$(document).ready(function(){
    
    var testSeries = [
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
    var testSeries2 = [
            [
                {value: 183, endDate: "2009-05-01T03:59:59.000Z"},
                {value: 289, endDate: "2009-06-01T03:59:59.000Z"},
                {value: 108, endDate: "2009-07-01T03:59:59.000Z"},
                {value: 280, endDate: "2009-08-01T03:59:59.000Z"},
                {value: 140, endDate: "2009-09-01T03:59:59.000Z"},
                {value: 282, endDate: "2009-10-01T03:59:59.000Z"},
                {value: 185, endDate: "2009-11-01T03:59:59.000Z"},
                {value: 207, endDate: "2009-12-01T04:59:59.000Z"},
                {value: 102, endDate: "2010-01-01T04:59:59.000Z"},
                {value: 253, endDate: "2010-02-01T04:59:59.000Z"},
                {value: 148, endDate: "2010-03-01T04:59:59.000Z"},
                {value: 248, endDate: "2010-04-01T03:59:59.000Z"}
            ],
            [
                {value: 183, endDate: "2009-05-01T03:59:59.000Z"},
                {value: 289, endDate: "2009-06-01T03:59:59.000Z"},
                {value: 108, endDate: "2009-07-01T03:59:59.000Z"},
                {value: 280, endDate: "2009-08-01T03:59:59.000Z"},
                {value: 290, endDate: "2009-09-01T03:59:59.000Z"},
                {value: 182, endDate: "2009-10-01T03:59:59.000Z"},
                {value: 285, endDate: "2009-11-01T03:59:59.000Z"},
                {value: 207, endDate: "2009-12-01T04:59:59.000Z"},
                {value: 102, endDate: "2010-01-01T04:59:59.000Z"},
                {value: 153, endDate: "2010-02-01T04:59:59.000Z"},
                {value: 48, endDate: "2010-03-01T04:59:59.000Z"},
                {value: 248, endDate: "2010-04-01T03:59:59.000Z"}
            ]
        ];
    
    var tooltips = ['tip 1', 'tip 2', 'tip 3', 'tip 4', 'tip 5', 'tip 6', 'tip 7', 'tip 8', 'tip', 'tip', 'tip', 'tip'];
    var tipFormat = function(tip) {
        var formatted = '<p>' + tip + '</p>';
      return  formatted; 
    };
    
    var line = elroi($('#line').find('.graph'), [{series:testSeries, options: {type:'line'}}]);
    var line = elroi($('#step').find('.graph'), [{series:testSeries, options: {type:'step'}}]);
    var line_small_points = elroi($('#line_small_points').find('.graph'), [{series:testSeries, options: {type:'line', showPoints:true, pointStroke:false}}]);
    var line_points = elroi($('#line_points').find('.graph'), [{series:testSeries, options: {type:'line', showPoints:true}}]);
    var line_points_animated = elroi($('#line_points_animated').find('.graph'), [{series:testSeries, options: {type:'line', showPoints:true , animatePoints:true}}]);
    var multi_series_multi_axis = elroi(
        $('#multi_series_multi_axis').find('.graph'), 
        [{
                series:testSeries, options: {type:'bar', showPoints:true , animatePoints:true}
            }, {
                series:testSeries2, options: {type:'line', showPoints:true , animatePoints:true}
            }
        ],
        {
            axes: {
                y2: {
                    show: true,
                    seriesIndex: 1
                }
            }
        }
    );

    var stackedBar = elroi(
        $('#stacked-bar').find('.graph'), 
        [{series:testSeries, options: {type:'stackedBar'}}],
        {
                tooltip : {
                    formatter: tipFormat
                }
        },
        tooltips
        
    );
    var pie = elroi($('#pie').find('.graph'), [{series:testSeries, options: {type:'pie'}}]);
    var bar = elroi($('#bar').find('.graph'), [{series:testSeries, options: {type:'bar'}}],
        {
            tooltip : {
                formatter: tipFormat
            }
        },
        tooltips);

});