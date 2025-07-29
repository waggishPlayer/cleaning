var myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("authkey", "<authkey>");

var raw = JSON.stringify({
    "integrated_number": "919203240991",
    "content_type": "template",
    "payload": {
        "messaging_product": "whatsapp",
        "type": "template",
        "template": {
            "name": "otp",
            "language": {
                "code": "en",
                "policy": "deterministic"
            },
            "namespace": "b870bc3c_9fa6_4bf8_b4b2_82078187366a",
            "to_and_components": [
                {
                    "to": [
                        "<list_of_phone_numbers>"
                    ],
                    "components": {
                        "body_1": {
                            "type": "text",
                            "value": "value1"
                        },
                        "button_1": {
                            "subtype": "url",
                            "type": "text",
                            "value": "<{{url text variable}}>"
                        }
                    }
                }
            ]
        }
    }
});

var requestOptions = {
  method: 'POST',
  headers: myHeaders,
  body: raw,
  redirect: 'follow'
};

fetch("https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
