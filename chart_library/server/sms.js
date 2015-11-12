var request = require('request');

var sms_url = 'http://sslsms.cafe24.com/sms_sender.php';
var params = {
  user_id: encodeBase64('doobabsms'),
  secure: encodeBase64('4cf9ee577238f252e7631a90820b3938'),
  sphone1: encodeBase64('010'),
  sphone2: encodeBase64('5564'),
  sphone3: encodeBase64('3754'),
	mode: encodeBase64('1')
};

function encodeBase64(str) {
	return new Buffer(str).toString('base64');
}

function sendSMS(to, msg, callback) {
	params.rphone = encodeBase64(to);
	params.msg = encodeBase64(msg);

	var smsRequest = request.post(sms_url, function(err, res, body) {
		if (err) return console.error('cafe24-sms: request failed: ', err);
		else {
			callback(res, body);
		}
	});

	var form = smsRequest.form();
	for (var param in params) {
		form.append(param, params[param]);
	}
}


exports.send = sendSMS;
