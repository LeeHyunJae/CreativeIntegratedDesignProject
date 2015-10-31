function encodeBase64(str) {
	return new Buffer(str).toString('base64');
}

function sendSMS() {
	var sms_url = "http://sslsms.cafe24.com/sms_sender.php";
	var parameters = {
		user_id: encodeBase64('doobabsms'),
		secure: encodeBase64('4cf9ee577238f252e7631a90820b3938'),
		sphone1: encodeBase64('010'),
		sphone2: encodeBase64('5564'),
		sphone3: encodeBase64('3754'),
		rphone: encodeBase64('010-6278-5215'),
		msg: encodeBase64('Hello, world!')
	};
	var smsRequest = request.post(sms_url, function(err, res, body) {
		if (err) return console.error('cafe24-sms: request failed: ', err);
		else {
			console.log("cafe24-sms: request succeeded: " + body);
			cb(res, body);
		}
	});
}

sendSMS();