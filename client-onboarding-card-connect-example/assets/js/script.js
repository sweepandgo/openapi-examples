// Grab United State states and add them to a select box
let url = "https://gist.githubusercontent.com/mshafrir/2646763/raw/8b0dbb93521f5d6889502305335104218454c2bf/states_hash.json"
let states;
fetch(url)
    .then(res => res.json())
    .then(out => {
        select = document.getElementById('state');
        Object.entries(out).forEach(entry => {
            const [key, value] = entry;
            var option = document.createElement("option")
            option.value = key
            option.innerHTML = value
            select.appendChild(option)
        })
    })
    .catch(err => console.error(err));

//Get card token from card connect and submit the data to Sweep&Go Open API
let cardConnectCss = ''
cardConnectCss += 'body{margin:0;}'
cardConnectCss += '.error{color:rgb(255,82,82);}'
cardConnectCss += 'br{display:none;}'
cardConnectCss += 'label{display:none;}'
cardConnectCss += 'input{width:100%;background: white;box-sizing: border-box;font-weight: 400;border: 1px solid rgb(207, 215, 223);border-radius: 15px;color: rgb(50, 49, 94);outline: none;flex: 1;padding: 10px 20px;cursor: text; }'
cardConnectCss += 'input.error{color:rgb(255,82,82);border-color: rgb(255,82,82);}'
cardConnectCss += 'input:focus{outline:none; border: 1px solid; border-color: rgb(0,172,193);}'
cardConnectCss += 'input.error:focus{outline:none; border: 1px solid; border-color: rgb(255,82,82);}'
const options = {
    invalidinputevent: true,
    cardinputmaxlength: '19',
    formatinput: true,
    cardnumbernumericonly: true,
    placeholder: 'Card number',
    orientation: 'horizontal',
}
const cardConnectOptions = Object.entries(options).map(i => `${i[0]}=${i[1]}`).join('&');
let cardConnectIframeURL = `https://fts.cardconnect.com/itoke/ajax-tokenizer.html?${cardConnectOptions}&css=${encodeURI(cardConnectCss)}`
document.getElementById("tokenFrame").src = cardConnectIframeURL;
var cc_token;
var cardNumberValidationError;
window.addEventListener('message', onIframeEvent, false);
function onIframeEvent(event) {
    if(event.origin === 'https://fts.cardconnect.com') {
        var token = JSON.parse(event.data);
        cc_token = token.message;
        cardNumberValidationError = token.validationError || "";
      }
}
document.getElementById("send_data").onclick = function() {
    if (typeof cc_token !== 'undefined') {
        let data = new FormData(document.querySelector('form'));
        data = Object.fromEntries(data);
        let additional_data = {
            "credit_card_token": cc_token,
            "initial_cleanup_required": true,
            "expiry": `${data.expiry_month}${data.expiry_year}`
        }
        data = {...data, ...additional_data}
        fetch("https://openapi.sweepandgo.com/api/v1/residential/onboarding", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer KxjJjBNLdBU9kym2tWM4KcULxKE89ZpbBbeBzEdKwVhRgE6be1iFNRMK4H8RYqOR',
                'Accept': 'application/json'
            }, 
            body: JSON.stringify(data)
        }).then(response => {
            console.log(response);
        })
    } else {
        console.error(cardNumberValidationError);
    }
}