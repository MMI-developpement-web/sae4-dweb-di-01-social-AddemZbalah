import { Outlet } from "react-router-dom";

export default function PageSlot() {
  return (
    <section>
      <Outlet />
    </section>
  );
}
