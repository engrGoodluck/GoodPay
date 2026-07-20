const balance = document.getElementById("balance");
const eye = document.getElementById("toggleBalance");

let visible = true;

eye.addEventListener("click", function(){

    if(visible){

        balance.textContent = "••••••••••";
        eye.src = "../../assets/icons/eye-off.svg";
        visible = false;

    }else{

        balance.textContent = "₦378,765,030.00";
        eye.src = "../../assets/icons/eye.svg";
        visible = true;

    }

});