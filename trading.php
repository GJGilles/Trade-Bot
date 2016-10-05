<!DOCTYPE html>
<html>
<?php
	include 'base_top.php';
?>
<body style="background-color: grey;">
	<?php
		include 'nav_top.php';
	?>
	<div id="accordionLogin" class="col-md-6">
		<h3> Input API Info </h3>
		<div style="max-height: 200px;">
			<div class="row">
				<div class="col-xs-3">
					<label>API KEY<input id="apiKeyFld" style="color: black;" /></label>
				</div>
			</div>	
			<div class="row">
				<div class="col-xs-3">
					<label>SECRET KEY<input id="secretKeyFld"  style="color: black;"/></label>
				</div>
				<div class="col-xs-2"></div>
				<button class="col-xs-2 btn btn-success" onclick="tradeClass.initTradingAPI()">Start Trading!</button> 
			</div>
		</div>
	</div>
	<?php
	include 'nav_bot.php';
	?>
</body>
<?php
	include 'base_bot.php';
?>
</html>