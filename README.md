# Elroi

## About

Elroi is a graphing library built for Opower's Astro web application

It is based on the Raphael JavaScript library, meaning that every element
in the chart is essentially an HTML element. This has powerful implications,
since you can augment everything elroi does with straight HTML, CSS, and JavaScript.

## Usage

Elroi requires jQuery http://jquery.com (tested with 1.6.4 and 1.7.1) and RaphaelJS http://http://raphaeljs.com/ (1.5.2).  To use elroi,
include jQuery, Raphael, elroi.js, and elroi.css.  You can create and draw a graph with:

    var myGraph = elroi($element, dataSeries, [graphOptions], [tooltips]);

$element - a jQuery object for the HMTL element that will contain the graph.  The height and width of the graph elroi creates are determined
by your styles on $element.

    example: var $element = $('#my-graph-container');`

data - The data to graph.  Elroi will accept a variety of formats for this.
  
An array.
    
    dataSeries = [4,6,8,4,3,9];
    
An array of values and dates

    dataSeries = [
        {value: 4, date: "2009-05-01T03:59:59.000Z"}, 
        {value: 8, date: "2009-05-02T03:59:59.000Z"}, 
        {value: 14, date: "2009-05-03T03:59:59.000Z"}, 
        {value: 6, date: "2009-05-04T03:59:59.000Z"}, 
        {value: 9, date: "2009-05-05T03:59:59.000Z"}
    ];
    
An object with a data series, and an optional series-specific graph option:

    dataSeries = {
        series: [
            {value: 4, date: "2009-05-01T03:59:59.000Z"}, 
            {value: 8, date: "2009-05-02T03:59:59.000Z"}, 
            {value: 14, date: "2009-05-03T03:59:59.000Z"}, 
            {value: 6, date: "2009-05-04T03:59:59.000Z"}, 
            {value: 9, date: "2009-05-05T03:59:59.000Z"}
        ],
        options : { type: 'bar'}
    };
    
An object with multiple arrays of series:

    dataSeries = {
        series: [
            [
                {value: 4, date: "2009-05-01T03:59:59.000Z"}, 
                {value: 8, date: "2009-05-02T03:59:59.000Z"}, 
                {value: 14, date: "2009-05-03T03:59:59.000Z"}, 
                {value: 6, date: "2009-05-04T03:59:59.000Z"}, 
                {value: 9, date: "2009-05-05T03:59:59.000Z"}
            ],
            [
                {value: 54, date: "2009-05-01T03:59:59.000Z"}, 
                {value: 81, date: "2009-05-02T03:59:59.000Z"}, 
                {value: 64, date: "2009-05-03T03:59:59.000Z"}, 
                {value: 66, date: "2009-05-04T03:59:59.000Z"}, 
                {value: 79, date: "2009-05-05T03:59:59.000Z"}
            ]
        ],
        options : { type: 'stackedBar'}
    };


An array of data objects and their optional series-specific options.  
Each data object contains a series array, which contains arrays of series data points.
Each data object can also take an optional series specific options property.

    var dataSeries = [
        {
            series:[
                [
                    {value: 183, endDate: "2009-05-01T03:59:59.000Z"},
                    {value: 289, endDate: "2009-06-01T03:59:59.000Z"},
                    {value: 108, endDate: "2009-07-01T03:59:59.000Z"}
                ],
                [
                    {value: 683, endDate: "2009-05-01T03:59:59.000Z"},
                    {value: 789, endDate: "2009-06-01T03:59:59.000Z"},
                    {value: 408, endDate: "2009-07-01T03:59:59.000Z"}
                ],
            ]
            options:  {type:'bar', showPoints:true , animatePoints:true}
        }
    ];

options - An object to configure graph-wide options.  This is where you can set colors, axes, tooltips, animation, and other things.

    var graphOptions = {
        axes: {
            y1: {
                show: false
            }
            y2: {
                show: true,
                seriesIndex: 0
            }
        }
    };

For a ton of usage examples, see

* examples/index.html
* examples/examples.js


## Development

There are two scripts to aid in developing elroi:

  bin/combine.sh -- Combines all of the elroi source files into a single elroi.js library.
  bin/watch.sh   -- When invoked, this script listens for changes in the working directory
                    and runs combine.sh to regenerate the elroi.js library.

                    The list of directories that watch.rb will listen to is defined in
                    watchr_script.file

### Development Requirements

To work with combine.sh and watch.sh, you'll need to install two ruby gems:

  gem install watchr
  gem install sprockets

### Test

Tests are written in QUnit. To run the tests, open this in any browser:

  test/index.html


##  License

Distributes under the Apache License, see LICENSE.txt

