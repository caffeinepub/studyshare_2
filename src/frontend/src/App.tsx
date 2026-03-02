import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
import MaterialDetailPage from "./pages/MaterialDetailPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import UploadPage from "./pages/UploadPage";

// ── Root Layout ──────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster richColors position="top-right" />
    </div>
  ),
});

// ── Routes ────────────────────────────────────────────────────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const materialDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/material/$id",
  component: MaterialDetailPage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment/success",
  component: PaymentSuccessPage,
});

const paymentCancelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/payment/cancel",
  component: PaymentCancelPage,
});

// ── Router ────────────────────────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  indexRoute,
  materialDetailRoute,
  uploadRoute,
  dashboardRoute,
  adminRoute,
  paymentSuccessRoute,
  paymentCancelRoute,
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
