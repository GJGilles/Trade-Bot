$(function () {
	$('#accordionLogin').accordion();
	$('#accordionGraph').accordion();

});

var tradeClass = {
	isRepeating: false,
	apiKey: null,
	secretKey: null,
	tradeVals: {},
	historicData: [],
	initMarketData: function(){
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
		
		Q($.ajax({
			type: 'GET', 
			url:'//api.hitbtc.com/api/1/public/ticker',
			contentType:'text/plain',
			xhrFields: {
				withCredentials: false
			}
		})).then(function(data){
			if(typeof data['BTCUSD'] == 'undefined') return;
			var done = Q.defer();
			Q($.ajax({
				type: 'GET',
				url:'//api.hitbtc.com/api/1/public/symbols',
				contentType: 'text/plain',
				xhrFields: {
					withCredentials: false
				}
			})).then(function(info){
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
			tradeClass.tradeVals['USD/BTC'].low = data['BTCUSD'].low;
			tradeClass.tradeVals['USD/BTC'].high = data['BTCUSD'].high;
			tradeClass.tradeVals['USD/BTC'].volume = data['BTCUSD'].volume;
			$.each(data, function(idx){
				if(idx.substr(idx.length - 3, 3) == 'BTC'){
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)] = {};
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].ask = (parseFloat(tradeClass.tradeVals['USD/BTC'].ask)*(parseFloat(this.ask)));
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].bid = (parseFloat(tradeClass.tradeVals['USD/BTC'].bid)*(parseFloat(this.bid)));	
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].lot = parseFloat(this.lot);	
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].low = (parseFloat(tradeClass.tradeVals['USD/BTC'].low)*(parseFloat(this.low)));
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].high = (parseFloat(tradeClass.tradeVals['USD/BTC'].high)*(parseFloat(this.high)));
					tradeClass.tradeVals['USD/'+idx.substr(0, idx.length - 3)].volume = parseFloat(this.volume);
				}
			});
			
			tradeClass.loadTradeValChart();
			tradeClass.loadMarketMoveChart();
			tradeClass.loadHistoricDataChart();
		});
	},
	loadTradeValChart: function(){
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
		$('#currChartContainer').highcharts({
			chart: {
	            type: 'column',
	            inverted: true
	        },

	        title: {
	            text: 'Current Crypto Prices'
	        },

	        xAxis: {
	            categories: chartData[0]
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

	        series: chartData[1]
		});
	},
	loadMarketMoveChart: function(){
		var chartData = [[], []];
		chartData[1].push({type: 'column', name:"High", data:[]});
		chartData[1].push({type: 'column', name:"Low", data:[]});
		chartData[1].push({type: 'pie', name: 'Percentage of Market Movement', data:[], center: [300, 50], size: 100, showInLegend: false, dataLabels: {enabled: false}});
		$.each(tradeClass.tradeVals, function(idx){
			if(idx == 'USD/BTC' && !$('#showBTCValue')[0].checked){
				return true;
			}
			chartData[0].push(idx.substr(4, idx.length-3));
			chartData[1][0]['data'].push(parseFloat(this.high)*parseFloat(this.volume));
			chartData[1][1]['data'].push(parseFloat(this.low)*parseFloat(this.volume));
			chartData[1][2]['data'].push({name: idx.substr(4, idx.length-3), y: parseFloat(this.high)*parseFloat(this.volume)});
		});
		$('#marketMoveChartContainer').highcharts({
			title: {
	            text: 'Market Movement'
	        },
	        xAxis: {
	            categories: chartData[0]
	        },
	        series: chartData[1]
	    });
	},
	loadHistoricDataChart: function(){
		if (typeof tradeClass.historicData[0] == 'undefined'){
			tradeClass.historicData[0] = [];
			tradeClass.historicData[1] = [];
			$.each(tradeClass.tradeVals, function(idx){
				if(idx == 'USD/BTC' /*&& !$('#showBTCValue')[0].checked*/){
					return true;
				}
				tradeClass.historicData[1].push({ name: idx.substr(4, idx.length-3) , type: 'line', yAxis: 0, data: [], tooltip: {valuePrefix: '$'}});
				tradeClass.historicData[1].push({ name: idx.substr(4, idx.length-3) , type: 'line', yAxis: 1, data: [], tooltip: {valuePrefix: '$', valueSuffix: '/24h'}});
			});
		}
		tradeClass.historicData[0].push(moment().format('Do MMM YYYY, hh:mm:ss'));
		var i=0;
		$.each(tradeClass.tradeVals, function(idx){
			if(idx == 'USD/BTC' /*&& !$('#showBTCValue')[0].checked*/){
				return true;
			}
			tradeClass.historicData[1][i]['data'].push((parseFloat(this.ask)*parseFloat(this.lot)+parseFloat(this.bid)*parseFloat(this.lot))/2);
			i++;
			tradeClass.historicData[1][i]['data'].push((parseFloat(this.low)*parseFloat(this.volume)+parseFloat(this.high)*parseFloat(this.volume))/2);
			i++;
		});
		//Add date reformatting when there are multiple minutes/hours/days etc...

		$('#marketHistoricChartContainer').highcharts({
	        chart: {
	            zoomType: 'xy'
	        },
	        title: {
	            text: 'Market Data Since Program Start'
	        },
	        xAxis: [{
	            categories: tradeClass.historicData[0],
	            crosshair: true
	        }],
	        yAxis: [{ // Primary yAxis
	            labels: {
	                format: '${value}',
	            },
	            title: {
	                text: 'Trading Price'
	            }
	        }, { // Secondary yAxis
	            title: {
	                text: 'Market Movement'
	            },
	            labels: {
	                format: '${value}/24h'
	            },
	            opposite: true
	        }],
	        tooltip: {
	            shared: true
	        },
	        legend: {
	            enabled: false
	        },
	        series: tradeClass.historicData[1]
	    });
	},
	initTradingAPI: function(){
		Q($.post('auth.php?a=newSession&apiKey='+$('#apiKeyFld')[0].value+'&secretKey='+$('#secretKeyFld')[0].value)
		).then(function(){
			$.post('auth.php?a=testCase');
		});
	}
}