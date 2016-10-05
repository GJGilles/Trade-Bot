<!DOCTYPE html>
<html>
<?php
	include 'base_top.php';
?>
<body style="background-color: grey;">
	<?php
		include dirname(__FILE__) . '/nav_top.php';
	?>
	<div class="main-header"><h3>Glenn's Trading Interface</h3></div>
	<br/>
	<div class="text-bubble">
		<div>
			This is a page was created by Glennarthyr Gillespie with the intention to create an easier and more intuitive interface for trading cryptocurrency.
		</div>
	</div>
	<br/>
	<div class="text-bubble" style="height: 50px;">
		<span><strong>Useful Libraries</strong></span>
		<br/>
		<div class="col-xs-2">
			<span class="col-xs-2">Bootstrap</span>
		</div>
		<div class="col-xs-2">
			<span>JQuery</span>
		</div>
		<div class="col-xs-2">
			<span>JQuery UI</span>
		</div>
		<div class="col-xs-2">
			<span>Highcharts</span>
		</div>
		<div class="col-xs-2">
			<span>Moment.js</span>
		</div>
		<div class="col-xs-2">
			<span>Q.js</span>
		</div>
	</div>
	<?php
	include dirname(__FILE__) . '/nav_bot.php';
	?>
</body>
<?php
	include dirname(__FILE__) . '/base_bot.php';
?>
</html>