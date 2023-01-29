const generateHTML = (firstName, lastName, email, result, isEmail) => {
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
          </style>
      </head>
      <body>
          <div class="main-box">
          <div class="box-header">
              <h1>${firstName} ${lastName}'s results</h1>
          </div>
          <div class="user-results">
              <div class="box-titles">
              </div>
              <img src="${isEmail ? "cid:result" : `${result}`}"/>
              <hr />
          </div>
          <div class="box-footer">
              <h3>Quiz</h3>
          </div>
          </div>
      </body>
      </html>
    `;
};

module.exports = generateHTML;
