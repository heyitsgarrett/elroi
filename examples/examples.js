$(document).ready(function(){
    
    var testSeries = [
        [
            {value: 683,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/4?meterType=ELEC",pointFlag: false,endDate: "2009-05-01T03:59:59.000Z"},
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
        ],
        [
            {value: 383,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/4?meterType=ELEC",pointFlag: false,endDate: "2009-05-01T03:59:59.000Z"},
            {value: 289,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/5?meterType=ELEC",pointFlag: false,endDate: "2009-06-01T03:59:59.000Z"},
            {value: 208,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/6?meterType=ELEC",pointFlag: false,endDate: "2009-07-01T03:59:59.000Z"},
            {value: 380,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/7?meterType=ELEC",pointFlag: false,endDate: "2009-08-01T03:59:59.000Z"},
            {value: 490,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/8?meterType=ELEC",pointFlag: false,endDate: "2009-09-01T03:59:59.000Z"},
            {value: 282,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/9?meterType=ELEC",pointFlag: false,endDate: "2009-10-01T03:59:59.000Z"},
            {value: 385,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/10?meterType=ELEC",pointFlag: false,endDate: "2009-11-01T03:59:59.000Z"},
            {value: 507,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/11?meterType=ELEC",pointFlag: false,endDate: "2009-12-01T04:59:59.000Z"},
            {value: 802,clickTarget: "/ei/app/myEnergyUse/usage/bill/2009/12?meterType=ELEC",pointFlag: false,endDate: "2010-01-01T04:59:59.000Z"},
            {value: 453,clickTarget: "/ei/app/myEnergyUse/usage/bill/2010/1?meterType=ELEC",pointFlag: false,endDate: "2010-02-01T04:59:59.000Z"},
            {value: 348,clickTarget: "/ei/app/myEnergyUse/usage/bill/2010/2?meterType=ELEC",pointFlag: false,endDate: "2010-03-01T04:59:59.000Z"},
            {value: 248,clickTarget: "/ei/app/myEnergyUse/usage/bill/2010/3?meterType=ELEC",pointFlag: false,endDate: "2010-04-01T03:59:59.000Z"}
        ]
    ];

    var line = elroi({$el:$('#line-graph'), data: [{series:testSeries, options: {type:'line'}}]}).draw();
    var stackedBar = elroi({$el:$('#stacked-bar-graph'), data: [{series:testSeries, options: {type:'stackedBar'}}]}).draw();
    var pie = elroi({$el:$('#pie-graph'), data: [{series:testSeries, options: {type:'pie'}}]}).draw();
    
});