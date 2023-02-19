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
              .description { padding-top: ${description ? 610 : 0}px; }
          </style>
      </head>
      <body>
          <div class="main-box">
          <div class="user-results">
              <div class="box-titles">
              </div>
              <img src="${isEmail ? "cid:result" : `${result}`
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
}