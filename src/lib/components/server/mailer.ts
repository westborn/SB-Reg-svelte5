import nodemailer from 'nodemailer';

import { SECRET_EMAIL_USER, SECRET_EMAIL_PASSWORD } from '$env/static/private';

const transporter = nodemailer.createTransport({
	host: 'smtp.gmail.com',
	port: 465,
	secure: true,
	auth: {
		user: SECRET_EMAIL_USER,
		pass: SECRET_EMAIL_PASSWORD
		// pass: 'WRONG_PASSWORD'
	}
});

// export async function sendGoogleEmail(to: string, subject: string, html: string) {
// 	return transporter.sendMail({
// 		to,
// 		subject,
// 		html
// 	});
// }
// mailotions are:
// from = 'Sculpture Bermagui<do_not_reply@sculpturebermagui.org.au>',
// to,
// subject= "✔ You've completed your Sculpture Exhibition Registration ✔",
// // text: '✔ Hello world ✔', // plaintext body
// // html: '<b>✔ Hello world ✔</b>' // html body
// html

export async function sendGoogleEmail(mailOptions: any) {
	// send mail with defined transport object
	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log('Error was: ', error);
			return error.message;
		} else {
			// console.log('Message sent: ' + info.response);
			return info.response;
		}
	});
}
