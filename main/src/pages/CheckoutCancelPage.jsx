function CheckoutCancelPage() {
  return (
    <div className="page-checkout-cancel min-h-screen bg-[#f7f8fa] px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-500">
          Checkout Canceled
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Your payment was canceled
        </h1>
        <p className="mt-3 text-slate-500">
          No worries. Your cart is still available and you can return whenever you are ready.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              window.location.href = "/";
            }}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutCancelPage;