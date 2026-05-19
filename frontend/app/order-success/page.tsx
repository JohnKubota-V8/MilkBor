"use client";

import { CustomerLayout } from "../components/CustomerLayout";
import { OrderSuccess } from "../pages/customer/OrderSuccess";

export default function Page() {
  return (
    <CustomerLayout>
      <OrderSuccess />
    </CustomerLayout>
  );
}
