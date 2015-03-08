<?php
namespace Hitbtc;
/**
* show off @method
*
* @method string balance() balance( array $params )
* @method string ordersActive() ordersActive( array $params )
* @method string new_order() new_order( array $params )
* @method string cancel_order() cancel_order( array $params )
* @method string trades() trades( array $params )
* @method string ordersRecent() ordersRecent( array $params )
*
* @package Hitbtc
*/
class TradingApi
{
	CONST HITBTC_API_URL = 'http://demo-api.hitbtc.com';
	CONST HITBTC_TRADING_API_URL_SEGMENT = '/api/1/trading/';
	public $_key, $_secret, $interface;
	private $_availableMethods = array(
		'balance',
		'orders/active',
		'new_order',
		'cancel_order',
		'trades',
		'orders/recent',
	);
	private $_postMethods = array(
		'new_order',
		'cancel_order'
	);
	public function __construct($key, $secret)
	{
		$this->_key = $key;
		$this->_secret = $secret;
		$this->_nonce = time()*1E3;
	}
	public function __call($name, $arguments) {
		$methodPathParts = preg_split('/(?=[A-Z])/', $name);
		$methodPathParts = array_map(
		function($pathSegment) { return strtolower($pathSegment); },
		$methodPathParts
		);
		$method = implode('/', $methodPathParts);
		if(!in_array($method, $this->_availableMethods)){
		throw new \Exception( 'Method that you try to call doesn\'t exists!' );
		}
		return $this->_request($method, $arguments, in_array($method, $this->_postMethods));
	}
	private function _request($method, $arguments, $isPost = FALSE) {
		$requestUri = self::HITBTC_TRADING_API_URL_SEGMENT
		. $method
		. '?nonce=' . $this->_getNonce()
		. '&apikey=' . $this->_key;
		$arguments = sizeof($arguments) > 0 ? $arguments[0] : array();
		$params = http_build_query($arguments);
		if (strlen($params) && $isPost === FALSE) {
		$requestUri .= '&' . $params;
		}
		$ch = curl_init();
		curl_setopt_array($ch, array(
		CURLOPT_URL => self::HITBTC_API_URL . $requestUri,
		CURLOPT_CONNECTTIMEOUT => 10,
		CURLOPT_RETURNTRANSFER => 1
		));
		if($isPost) {
		curl_setopt($ch, CURLOPT_POST, TRUE);
		curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		}
		curl_setopt($ch, CURLOPT_HTTPHEADER, array('X-Signature: ' . $this->_signature($requestUri, $isPost ? $params : '')));
		$result = curl_exec($ch);
		curl_close($ch);
		return $result;
	}
	private function _signature($uri, $postData)
	{
		return strtolower(hash_hmac('sha512', $uri . $postData, $this->_secret));
	}
	private function _getNonce()
	{
		return $this->_nonce++;
	}
}

function randomString($length) {
	$key = '';
	$keys = array_merge(range(0, 9), range('a', 'z'));
	for ($i = 0; $i < $length; $i++) {
		$key .= $keys[array_rand($keys)];
	}
	return $key;
}

session_start();
if (isset($_SESSION['_key'])){
	$_key = $_SESSION['_key'];
	$_secret = $_SESSION['_secret'];
}

try{
	switch ($_GET['a']){
	case 'newSession':
		global $_key, $_secret;
		$_SESSION['_key'] = $_GET['apiKey'];
		$_SESSION['_secret'] = $_GET['secretKey'];
		break;	

	case 'testCase':
		$interface = new \Hitbtc\TradingApi($_key, $_secret);
		$newOrderId = randomString(rand(8, 30));
		echo $interface->new_order(array(
			'clientOrderId' => $newOrderId,
			'symbol' => 'BTCUSD',
			'side' => 'buy',
			'price' => 100.01, // $100.01
			'quantity' => 1, // 1 lot => 0.01 BTC
			'type' => 'limit',
			'timeInForce' => 'GTC'
		));
		break;
	}

}catch ( Exception $e ) {
	echo json_encode( array( 'error'=>true, 'message'=>$e->getMessage() ) );
}

/**
* Create instance and provide your api and secret keys as params
**/
//$interface = new \Hitbtc\TradingApi('', '');
/**
* Try to place order
**/
//$newOrderId = randomString(rand(8, 30));
//echo $interface->new_order(array(
	//'clientOrderId' => $newOrderId,
	//'symbol' => 'BTCUSD',
	//'side' => 'buy',
	//'price' => 100.01, // $100.01
	//'quantity' => 1, // 1 lot => 0.01 BTC
	//'type' => 'limit',
	//'timeInForce' => 'GTC'
//)); 

?>
