$(document).ready(function(){
    
    var testSeries = [
        [
            {value: 683, endDate: "2009-05-01T03:59:59.000Z"},
            {value: 689, endDate: "2009-06-01T03:59:59.000Z"},
            {value: 708, endDate: "2009-07-01T03:59:59.000Z"},
            {value: 680, endDate: "2009-08-01T03:59:59.000Z"},
            {value: 690, endDate: "2009-09-01T03:59:59.000Z"},
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
    
    var line = elroi({$el:$('#line').find('.graph'), data: [{series:testSeries, options: {type:'line'}}]}).draw();
    var stackedBar = elroi({$el:$('#stacked-bar').find('.graph'), data: [{series:testSeries, options: {type:'stackedBar'}}]}).draw();
    var pie = elroi({$el:$('#pie').find('.graph'), data: [{series:testSeries, options: {type:'pie'}}]}).draw();
    var bar = elroi({ $el:$('#bar').find('.graph'), data: [{series:testSeries, options: {type:'bar'}}]}).draw();
});