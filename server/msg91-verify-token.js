const fetch = require('node-fetch'); // You may need to install node-fetch

const url = new URL(
  'https://control.msg91.com/api/v5/widget/verifyAccessToken'
);

let headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

let body = {
  "authkey": "otp",
  "access-token": "{jwt_token_from_otp_widget}"
};

fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
})
.then(response => response.json())
.then(json => console.log(json))
.catch(error => console.error('Error:', error));
