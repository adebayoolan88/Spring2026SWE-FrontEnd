function CheckoutCancelPage() {
  return (
    <div className="page-checkout-cancel">
      <div className="checkout-cancel__container">
        <p className="checkout-cancel__eyebrow">
          Checkout Canceled
        </p>
        <h1 className="checkout-cancel__title">
          Your payment was canceled
        </h1>
        <p className="checkout-cancel__subtitle">
          No worries. Your cart is still available and you can return whenever you are ready.
        </p>

        <div className="checkout-cancel__action-row">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="checkout-cancel__primary-btn"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCancelPage;