var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'jchart301@gmail.com',
		pass: 'qqqq1234'
	}
});

function sendMail(to, subject, text, callback) {
	var info = {
		from: '"Jcharts" <jchart301@gmail.com>',
		to: to,
		subject: subject,
		text: text
	}

	transporter.sendMail(info, function (err, info) {
	  if (err) return console.error(err);
	  else {
	    console.log(info.response);
	  }
	});
}

exports.send = sendMail;
