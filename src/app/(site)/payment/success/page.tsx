import { PaymentResult } from "./payment-result";

// Click sends the user back here with ?payment_status=2 on success (anything else is a failure).
export default async function PaymentSuccessPage({ searchParams }: PageProps<"/payment/success">) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.payment_status) ? sp.payment_status[0] : sp.payment_status;
  return <PaymentResult ok={Number(raw) === 2} />;
}
