const form = document.getElementById("transferForm");

const recipient = document.getElementById("recipient");
const amount = document.getElementById("amount");
const note = document.getElementById("note");

form.addEventListener("submit", function(event){

    event.preventDefault();

    if(recipient.value === "" || amount.value === ""){

        alert("Please fill in all required fields.");

        return;

    }

    alert("Transfer details saved successfully!");alert(
    `Recipient: ${recipient.value}
Amount: ₦${amount.value}

Proceeding to confirmation...`
);

});