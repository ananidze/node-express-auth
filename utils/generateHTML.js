exports.generateHTML = ({ result, description, attach, isEmail }) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <style>
              body { font-family: monospace;}
              .main-box { padding: 20px 0;}
              .box-header { padding-left: 20px; }
              .box-titles { padding-left: 20px; }
              .user-results-item{ padding-left: 20px;}
              .box-footer{padding-left: 20px;}
              .description { padding-top: ${description ? 630 : 0}px; }
          </style>
      </head>
      <body>
          <div class="main-box">
          <div class="user-results">
              <div class="box-titles">
              </div>
              <img src="${
                isEmail ? "cid:result" : `${result}`
              }" style="width:100vw; object-fit: cover; max-width:1000px"/>
              <hr />
          </div>
          <div class="description">
            ${description ? description : ""}
          </div>
          </div>
      </body>
      </html>
    `;
};

exports.generateAttachment = ({ description }) => {
  return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Document</title>
          <style>
              body { font-family: monospace; }
          </style>
      </head>
      <body>
        ${description}
      </body>
      </html>
    `;
};

exports.paymentReminder = ({ name, amount, dueDate, url, title }) => {
  return `
  <!DOCTYPE html
	PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" style="color-scheme: light dark;">

<head>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="x-apple-disable-message-reformatting">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	<meta name="color-scheme" content="light dark">
	<meta name="supported-color-schemes" content="light dark">
	<title></title>
	<style type="text/css" rel="stylesheet" media="all">
@media only screen and (max-width: 500px) {
  .button {
    width: 100% !important;
    text-align: center !important;
  }
}
@media only screen and (max-width: 600px) {
  .email-body_inner,
.email-footer {
    width: 100% !important;
  }
}
@media (prefers-color-scheme: dark) {
  body,
.email-body,
.email-body_inner,
.email-content,
.email-wrapper,
.email-masthead,
.email-footer {
    background-color: #333333 !important;
    color: #fff !important;
  }

  p,
ul,
ol,
blockquote,
h1,
h2,
h3,
span,
.purchase_item {
    color: #fff !important;
  }

  .attributes_content,
.discount {
    background-color: #222 !important;
  }

  .email-masthead_name {
    text-shadow: none !important;
  }
}
</style>
</head>

<body style="height: 100%; margin: 0; -webkit-text-size-adjust: none; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; background-color: #f2f4f6; color: #51545e; width: 100%;">
	<span class="preheader" style="visibility: hidden; font-size: 1px; line-height: 1px; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; display: none;">This is an invoice for your purchase on {{ purchase_date }}. Please
		submit payment by ${dueDate}</span>
	<table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #f2f4f6;" bgcolor="#f2f4f6">
		<tr>
			<td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
				<table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 0; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0;">
					<tr>
						<td class="email-masthead" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 25px 0; text-align: center;" align="center">
							<a href="https://example.com" class="f-fallback email-masthead_name" style="font-size: 16px; font-weight: bold; color: #a8aaaf; text-decoration: none; text-shadow: 0 1px 0 white;">
								
							</a>
						</td>
					</tr>
					<tr>
						<td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; width: 100%; margin: 0; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0;">
							<table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="width: 570px; margin: 0 auto; padding: 0; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; background-color: #ffffff;" bgcolor="#ffffff">
								<tr>
									<td class="content-cell" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 45px;">
										<div class="f-fallback">
											<h1 style="margin-top: 0; color: #333333; font-size: 22px; font-weight: bold; text-align: left;">Hi ${name},</h1>
											<p style="margin: 0.4em 0 1.1875em; font-size: 16px; line-height: 1.625; color: #51545e;">
												This is an invoice for your recent purchase ${title}.
											</p>
											<table class="attributes" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 0 21px;">
												<tr>
													<td class="attributes_content" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; background-color: #f4f4f7; padding: 16px;" bgcolor="#f4f4f7">
														<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
															<tr>
																<td class="attributes_item" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;">
																	<span class="f-fallback">
																		<strong>Amount Due:</strong> ${amount}$
																	</span>
																</td>
															</tr>
															<tr>
																<td class="attributes_item" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 0;">
																	<span class="f-fallback">
																		<strong>Due Date:</strong> ${dueDate}
																	</span>
																</td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
											<table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" role="presentation" style="width: 100%; margin: 30px auto; padding: 0; -premailer-width: 100%; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center;">
												<tr>
													<td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
														<table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
															<tr>
																<td align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
																	<a href="${url}" class="f-fallback button button--green" target="_blank" style="display: inline-block; color: #fff; text-decoration: none; border-radius: 3px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); -webkit-text-size-adjust: none; box-sizing: border-box; background-color: #22bc66; border-top: 10px solid #22bc66; border-right: 18px solid #22bc66; border-bottom: 10px solid #22bc66; border-left: 18px solid #22bc66;">Pay Invoice</a>
																</td>
															</tr>
														</table>
													</td>
												</tr>
											</table>
											<table class="body-sub" role="presentation" style="margin-top: 25px; padding-top: 25px; border-top: 1px solid #eaeaec;">
												<tr>
													<td style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
														<p class="f-fallback sub" style="margin: 0.4em 0 1.1875em; line-height: 1.625; color: #51545e; font-size: 13px;">
															If you’re having trouble with the button above,
															copy and paste the URL below into your web
															browser.
														</p>
														<p class="f-fallback sub" style="margin: 0.4em 0 1.1875em; line-height: 1.625; color: #51545e; font-size: 13px;">${url}</p>
													</td>
												</tr>
											</table>
										</div>
									</td>
								</tr>
							</table>
						</td>
					</tr>
					<tr>
						<td style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px;">
							<table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation" style="width: 570px; margin: 0 auto; padding: 0; -premailer-width: 570px; -premailer-cellpadding: 0; -premailer-cellspacing: 0; text-align: center;">
								<tr>
									<td class="content-cell" align="center" style="word-break: break-word; font-family: 'Nunito Sans', Helvetica, Arial, sans-serif; font-size: 16px; padding: 45px;">
										<p class="f-fallback sub align-center" style="margin: 0.4em 0 1.1875em; line-height: 1.625; text-align: center; font-size: 13px; color: #a8aaaf;">
											[Company Name, LLC]
											<br>1234 Street Rd. <br>Suite 1234
										</p>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html> 
 `;
};

exports.successfulPayment = ({ name, amount }) => {
  return `
	<!DOCTYPE html>
<html>
<head>
	<title>Successful Payment</title>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
	<table style="width: 100%; max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5; background-color: #f6f6f6; padding: 20px;">
		<tr>
			<td style="background-color: #fff; padding: 30px;">
				<h2 style="font-size: 24px; margin-bottom: 20px;">Successful Payment</h2>
				<p>Dear ${name},</p>
				<p>We are writing to confirm that your payment of ${amount}$ has been successfully processed. Thank you for your business!</p>
				<p>Below are the details of your transaction:</p>
				<ul style="list-style: none; padding: 0; margin: 20px 0;">
					<li><strong>Amount:</strong> ${amount}$</li>
				</ul>
				<p>If you have any questions or concerns regarding your payment, please don't hesitate to contact us.</p>
				<p>Thank you for choosing [Company Name]. We appreciate your business!</p>
			</td>
		</tr>
		<tr>
			<td style="text-align: center; padding-top: 20px;">
				<p style="font-size: 14px; margin-bottom: 0;">[Company Name] | [Address], [City], [State] [Zip Code]</p>
				<p style="font-size: 14px; margin-bottom: 0;"><a href="[Website URL]" style="color: #333; text-decoration: none;">[Website URL]</a> | [Phone Number]</p>
			</td>
		</tr>
	</table>
</body>
</html>
`;
};
