/***************************
 *
 * This is for unit testing elroi
 * These can be tested here: http://localhost:8080/ei/app/test/index.html?elroi
 *
 */
(function(Q, $, elroi) {

    Q.module('elroi');


    var testSeries = [
        {
            options : {},
            series: [
                [
                    { value: 1 },
                    { value: 2 },
                    { value: 3 },
                    { value: 4 },
                    { value: 5 }
                ] ,
                [
                    { value: 6 },
                    { value: 7, pointFlag : $('<div>Flag!</div>') },
                    { value: 8 },
                    { value: 9 },
                    { value: 10 }
                ]
            ]
        }
    ];

    var testSeriesNoFlags = [
        {
            options : {},
            series: [
                [
                    { value: 1 },
                    { value: 2 },
                    { value: 3 },
                    { value: 4 },
                    { value: 5 }
                ] ,
                [
                    { value: 6 },
                    { value: 7 },
                    { value: 8 },
                    { value: 9 },
                    { value: 10 }
                ]
            ]
        }
    ];


    Q.test('elroi exists', function() {
        Q.ok(elroi, 'elroi');
    });

    Q.test('elroi has data tests', function() {
        Q.equal(elroi.fn.helpers.hasData([]), false, "No data at all");
        Q.equal(elroi.fn.helpers.hasData([{series: []}]), false, "Series data, but it's empty");
        Q.equal(elroi.fn.helpers.hasData([{series: [10,20,30]}]), true, "A valid set of data for graphing");
    });

    Q.test('elroi initialization', function() {

        var expectedLineGraphDataValues = [[1,2,3,4,5,6,7,8,9,10]],
                actualLineGraphDataValues = elroi.fn.helpers.getDataValues(testSeries, [{type:'line'}]);
        Q.deepEqual(actualLineGraphDataValues, expectedLineGraphDataValues, 'Data values for line graphs are correct');

        var expectedBarGraphDataValues = [[7,9,11,13,15]],
                actualBarGraphDataValues = elroi.fn.helpers.getDataValues(testSeries, [{type:'stackedBar'}]);
        Q.deepEqual(actualBarGraphDataValues, expectedBarGraphDataValues, 'Data values for bar graphs are correct');

        var expectedNoDataSet = [[0]],
                actualNoDataSet = elroi.fn.helpers.getDataValues('', [{type:'stackedBar'}]);
        Q.deepEqual(actualNoDataSet, expectedNoDataSet, 'Data values are defined when there is no data');

        var expectedSumSeries = [55],
                actualSumSeries = elroi.fn.helpers.sumSeries(expectedLineGraphDataValues);
        Q.deepEqual(actualSumSeries, expectedSumSeries, 'Series sum is correct');

        var shouldHavePointFlags = elroi.fn.helpers.hasPointFlags(testSeries);
        Q.equal(shouldHavePointFlags, true, 'Has point flags');
        var shouldNotHavePointFlags = elroi.fn.helpers.hasPointFlags(testSeriesNoFlags);
        Q.equal(shouldNotHavePointFlags, false, 'Does not have point flags');

    });
    
    Q.test('default tooltips', function(){
        var expectedTooltips = ['45<br/>56', '57<br/>78'];
        var testSeries = [{
                    series:[
                        [{value:45},{value:57}],
                        [{value:56},{value:78}]
                    ]
                }];
        Q.deepEqual(elroi.fn.helpers.buildDefaultTooltips(testSeries), expectedTooltips, "Has correct tooltips");
    });
    
    Q.test('elroi date formatter', function(){
        Q.equal(elroi.fn.formatDate('D', new Date('2011/06/01')), "Wed", 'Short day names');
        Q.equal(elroi.fn.formatDate('DD', new Date('2011/06/02')), "Thursday", 'Long day names');
        Q.equal(elroi.fn.formatDate('M', new Date('2011/06/01')), "Jun", 'Short month names');
        Q.equal(elroi.fn.formatDate('MM', new Date('2011/08/02')), "August", 'Long month names');
        Q.equal(elroi.fn.formatDate('d', new Date('2011/06/01')), "1", 'Single digit day');
        Q.equal(elroi.fn.formatDate('dd', new Date('2011/08/02')), "02", 'Double digit day');
        Q.equal(elroi.fn.formatDate('m', new Date('2011/04/01')), "4", 'Single digit month');
        Q.equal(elroi.fn.formatDate('mm', new Date('2011/03/02')), "03", 'Double digit month');
        Q.equal(elroi.fn.formatDate('y', new Date('2001/04/01')), "01", 'Double digit year');
        Q.equal(elroi.fn.formatDate('yy', new Date('2011/03/02')), "2011", 'Full year');
        Q.equal(elroi.fn.formatDate('h a', new Date('2011/03/02 13:00')), "1 pm", 'Single digit time with pm');
        Q.equal(elroi.fn.formatDate('hh a', new Date('2011/03/02 01:00')), "01 am", 'Double digit time with am');
        Q.equal(elroi.fn.formatDate('H:n', new Date('2011/03/02 01:09')), "1:09", 'Single digit military time');
        Q.equal(elroi.fn.formatDate('HH:n', new Date('2011/03/02 13:47')), "13:47", 'Double digit military time');
    });

    /*
     * This is the start of a series of visual tests for seeing elroi render in various ways.
     * These tests will be helpful for:
     *   - browser testing
     *   - performance testing
     *   - learning how elroi can be configured
     *   - testing all of elroi's features
     * We may break these into separate files because there is a lot of data.
     */
     
         
         Q.test('elroi visual test 1 - line graph', function() {
             var $graph = $('<div/>')
                             .css({width: 900, height: 300})
                             .appendTo($('#test'));
         
         
             var e = elroi(
                 $graph,
                 [
                         {
                             series:
                             [
                                 [
                                     {
                                         value: 683,
                                         clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/4?meterType=ELEC",
                                         pointFlag: false,
                                         endDate: "2009-05-01T03:59:59.000Z"
                                     },
                                     {value: 689,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/5?meterType=ELEC",pointFlag: false,endDate: "2009-06-01T03:59:59.000Z"},
                                     {value: 708,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/6?meterType=ELEC",pointFlag: false,endDate: "2009-07-01T03:59:59.000Z"},
                                     {value: 680,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/7?meterType=ELEC",pointFlag: false,endDate: "2009-08-01T03:59:59.000Z"},
                                     {value: 690,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/8?meterType=ELEC",pointFlag: false,endDate: "2009-09-01T03:59:59.000Z"},
                                     {value: 682,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/9?meterType=ELEC",pointFlag: false,endDate: "2009-10-01T03:59:59.000Z"},
                                     {value: 685,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/10?meterType=ELEC",pointFlag: false,endDate: "2009-11-01T03:59:59.000Z"},
                                     {value: 707,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/11?meterType=ELEC",pointFlag: false,endDate: "2009-12-01T04:59:59.000Z"},
                                     {value: 702,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/12?meterType=ELEC",pointFlag: false,endDate: "2010-01-01T04:59:59.000Z"},
                                     {value: 653,clickTarget: "/ei/app/myEnergyUse/usage/bill/2010/1?meterType=ELEC",pointFlag: false,endDate: "2010-02-01T04:59:59.000Z"},
                                     {value: 748,clickTarget: "/ei/app/myEnergyUse/usage/bill/2010/2?meterType=ELEC",pointFlag: false,endDate: "2010-03-01T04:59:59.000Z"},
                                     {value: 748,clickTarget: "/ei/app/myEnergyUse/usage/bill/2010/3?meterType=ELEC",pointFlag: false,endDate: "2010-04-01T03:59:59.000Z"}
                                 ]
                             ],
                             options:
                             {
                                 type:  "line"
                             }
                         }
                 ],
                 {
                     tooltip:
                     {
                         width: 180
                     },
                     colors:
                     [
                         "#33bbcc",
                         "#888888",
                         "#99cc33"
                     ],
                     axes:
                     {
                         x1: {},
                         y1:
                         {
                             unit: "kWh"
                         }
                     },
                     messages:
                     {
                         rateCallouts:
                         {
                             REBATE: "You earned a {0} rebate.",
                             PEAK_DAY: "Peak Day"
                         },
                         usage:
                         {
                             you:  "You",
                             effNeighbors:  "Efficient",
                             allNeighbors:  "All neighbors"
                         },
                         drilldowns:
                         {
                             DAY:  "View each day",
                             HOUR: "View each hour"
                         },
                         error:
                         {
                             noEnergyData:  "Data not available.",
                             noNeighbor:  "Neighbor comparisons are not yet available in this view. <a href=\"/ei/app/myEnergyUse/neighbors/year/\">See your comparison for the year &raquo;</a>",
                             noCostData: "Your costs are not yet available in this view. <a href=\"/ei/app/myEnergyUse/rates/year/\">See your costs for the year &raquo;</a>",
                             noData: "Data not available.",
                             noAmiBill: "This data is not available because your Smart Meter was not installed yet.",
                             noAmiDay: "This data is not available because your Smart Meter was not installed yet.<br /><a href=\"/ei/app/myEnergyUse/usage/day/2009/05/01\">See your first available day &raquo;</a>",
                             insufficientData: "We&#39;re still collecting the rest of your data for this day. Check back tomorrow."
                         },
                         units:
                         {
                             KWH: "kWh",
                             THERM: "therms"
                         },
                         axis:
                         {
                             dupeMonth: "<p><strong>About your billing cycle</strong></p><p>You had multiple bills during the same month. Each bill covers different days of the month. Move your mouse over the graph to see the date range.</p>"
                         }
                     },
                     labelDateFormat: "M",
                     errorMessage: false
                 },
                 [
                     {
                         dateRange:  "Apr 1 &ndash; Apr 30",
                         you: 683,
                         unit:  "kWh",
                         drillLink:  "/ei/app/myEnergyUse/usage/bill/2009/4?meterType=ELEC",
                         drillMessage: "View each day"
                     },
                     {dateRange: "May 1 &ndash; May 31",you: 689,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/5?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Jun 1 &ndash; Jun 30",you: 708,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/6?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Jul 1 &ndash; Jul 31",you: 680,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/7?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Aug 1 &ndash; Aug 31",you: 690,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/8?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Sep 1 &ndash; Sep 30",you: 682,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/9?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Oct 1 &ndash; Oct 31",you: 685,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/10?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Nov 1 &ndash; Nov 30",you: 707,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/11?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Dec 1 &ndash; Dec 31",you: 702,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2009/12?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Jan 1 &ndash; Jan 31",you: 653,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2010/1?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Feb 1 &ndash; Feb 28",you: 748,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2010/2?meterType=ELEC",drillMessage: "View each day"},
                     {dateRange: "Mar 1 &ndash; Mar 31",you: 748,unit: "kWh",drillLink: "/ei/app/myEnergyUse/usage/bill/2010/3?meterType=ELEC",drillMessage: "View each day"}
                 ]
             );
         
         });
         
         Q.test('elroi visual test 2 - no animations', function() {
              var $lineGraph = $('<div/>')
                  .css({width: 900, height: 300})
                  .appendTo($('#test')),
              $stackedBarGraph = $('<div/>')
                   .css({width: 900, height: 300})
                   .appendTo($('#test')),
              $barGraph = $('<div/>')
                  .css({width: 900, height: 300})
                  .appendTo($('#test')),
               testSeriesData = 
                            [
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
                                    {value: 389, endDate: "2009-06-01T03:59:59.000Z"},
                                    {value: 308, endDate: "2009-07-01T03:59:59.000Z"},
                                    {value: 380, endDate: "2009-08-01T03:59:59.000Z"},
                                    {value: 390, endDate: "2009-09-01T03:59:59.000Z"},
                                    {value: 382, endDate: "2009-10-01T03:59:59.000Z"},
                                    {value: 285, endDate: "2009-11-01T03:59:59.000Z"},
                                    {value: 407, endDate: "2009-12-01T04:59:59.000Z"},
                                    {value: 502, endDate: "2010-01-01T04:59:59.000Z"},
                                    {value: 353, endDate: "2010-02-01T04:59:59.000Z"},
                                    {value: 448, endDate: "2010-03-01T04:59:59.000Z"},
                                    {value: 448, endDate: "2010-04-01T03:59:59.000Z"}
                                ]
                            ];
         
         
             var lg = elroi(
                 $lineGraph,
                 [ { series: testSeriesData, options : { type: 'line'} }],
                 { animation: false }
             ),
             sbg = elroi(
                  $stackedBarGraph,
                  [ { series: testSeriesData, options : { type: 'stackedBar'} }],
                  { animation: false }
              ),
              bg = elroi(
                  $barGraph,
                  [ { series: testSeriesData, options : { type: 'bar'} }],
                  { animation: false }
              );
         
         });
    
    

}(QUnit, jQuery, elroi));
