const stripe = Stripe("pk_test_51RVYcDGfeT1ew9GLiLKfe8kMIG6OqzjAtf8nwHg8gZKgQesXRbLFW6EQrTrND2oH4T9Zaw6reCsrUkN8z6gvKuC400fd1yMFc2");
const API_URL = "https://ix4l6l8y36.execute-api.eu-west-1.amazonaws.com/production/create-checkout-session";

let elements;

initialize();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

async function initialize() {
  const clientSecret = sessionStorage.getItem("stripeClientSecret");
  if (!clientSecret) {
    console.error("No client secret found – go back to cart first!");
    return;
  }

  const appearance = {
    theme: 'stripe',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElementOptions = {
    layout: "accordion",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
}

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);

  const { error } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: "https://aydinaksel.github.io/tile-auctions-website/success.html",
    },
  });

  // This point will only be reached if there is an immediate error when
  // confirming the payment. Otherwise, your customer will be redirected to
  // your `return_url`. For some payment methods like iDEAL, your customer will
  // be redirected to an intermediate site first to authorize the payment, then
  // redirected to the `return_url`.
  if (error.type === "card_error" || error.type === "validation_error") {
    showMessage(error.message);
  } else {
    showMessage("An unexpected error occurred.");
  }

  setLoading(false);
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}
