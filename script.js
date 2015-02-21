$(function () {

	$('#accordionLogin').accordion();
	$('#accordionGraph').accordion();

});

var tradeClass = {
	isRepeating: false,
	apiKey: null,
	secretKey: null,
	tradeVals: {},
	init: function(){
		if(tradeClass.isRepeating){
			window.clearInterval(tradeClass.isRepeating);
		}
		tradeClass.getLoginInfo();
		tradeClass.isRepeating = window.setInterval(function() {tradeClass.mainLoop()}, 5000);
	},
	mainLoop: function(){
		tradeClass.getTradeVals();
	},
	getLoginInfo: function(){
		tradeClass.apiKey = $('#apiKeyFld')[0].value;
		tradeClass.secretKey = $('#secretKeyFld')[0].value;
	},
	getTradeVals: function(){
		
		Q($.ajax({dataType: "json", url:'//api.hitbtc.com/api/1/public/ticker'}))
		.then(function(data){
			if(typeof data['BTCUSD'] == 'undefined') return;
			var done = Q.defer();
			Q($.ajax({dataType: "json", url:'//api.hitbtc.com/api/1/public/symbols'}))
			.then(function(info){
				$.each(info.symbols, function(){
					var index = this.symbol;
					$.each(this, function(idx, val){
						data[index][idx] = val;
					});
				});
				done.resolve(data);
			});
			return done.promise;
		}).then(function(data){
			if(typeof data['BTCUSD'].lot == 'undefined') return;
			tradeClass.tradeVals['USD/BTC'] = {};
			tradeClass.tradeVals['USD/BTC'].ask = data['BTCUSD'].ask;	
			tradeClass.tradeVals['USD/BTC'].bid = data['BTCUSD'].bid;
			tradeClass.tradeVals['USD/BTC'].lot = data['BTCUSD'].lot;
			$.each(data, function(idx){
				if(idx.substr(idx.length - 3, 3) == 'BTC'){
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)] = {};
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].ask = (parseFloat(tradeClass.tradeVals['USD/BTC'].ask)*(parseFloat(this.ask)));
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].bid = (parseFloat(tradeClass.tradeVals['USD/BTC'].bid)*(parseFloat(this.bid)));	
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].lot = ((parseFloat(this.lot)));	
				}
			});
			var chartData = [[], []];
			chartData[1].push({name:"Ask", data:[]});
			chartData[1].push({name:"Bid", data:[]});
			$.each(tradeClass.tradeVals, function(idx){
				if(idx == 'USD/BTC' && !$('#showBTCValue')[0].checked){
					return true;
				}
				chartData[0].push(idx +", Lot: "+this.lot);
				chartData[1][0]['data'].push(parseFloat(this.ask)*parseFloat(this.lot));
				chartData[1][1]['data'].push(parseFloat(this.bid)*parseFloat(this.lot));
			});
			tradeClass.loadTradeValChart(chartData);
		});
	},
	loadTradeValChart: function(data){
		$('#currChartContainer').highcharts({
			chart: {
	            type: 'column',
	            inverted: true
	        },

	        title: {
	            text: 'Current Crypto Prices'
	        },

	        xAxis: {
	            categories: data[0]
	        },

	        yAxis: {
	            title: {
	                text: 'Price in USD'
	            }
	        },

	        plotOptions: {
	            columnrange: {
	                dataLabels: {
	                    enabled: true,
	                    formatter: function () {
	                        return this.y + '$';
	                    }
	                }
	            }
	        },

	        legend: {
	            enabled: false
	        },

	        series: data[1]
		});
	}
}