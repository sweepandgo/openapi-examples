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

// Configure stripe
let stripe = Stripe('pk_test_51CJP2iADskie72J5TBhkOG2662jueLT2jxTwpstXsi427KQfTgEM2Rrt4KKmiF0QjnRH5f16O8tjtLLWaYPgtiOk00povHqn0O');
let elements = stripe.elements();

// Set up Stripe.js and Elements to use in checkout form
elements = stripe.elements();
let style = {
    base: {
        color: '#32325d',
        fontFamily: 'Roboto, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
        color: 'rgba(0,0,0,0.42)'
        }
    },
    invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
    }
    };

let card = elements.create("card", { style: style });
card.mount("#card-element");


// Get card token from stripe and submit the data to Sweep&Go Open API
document.getElementById("send_data").onclick = function() {
    let data = new FormData(document.querySelector('form'));
    data = Object.fromEntries(data);
    stripe.createToken(card).then((result) => {
        let additional_data = {
            "credit_card_token": result.token.id,
            "initial_cleanup_required": true,
        }
        data = {...data, ...additional_data}
        fetch("https://staging-openapi.sweepandgo.net/api/v1/residential/onboarding", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR-KEY',
                'Accept': 'application/json'
            }, 
            body: JSON.stringify(data)
        }).then(response => {
            console.log(response)
        })
    })
}