import { useEffect } from "react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router";
import { AuthProvider, destination, useAuth } from "./auth/AuthContext";
import HomePage from "./pages/HomePage";
import AccountPage from "./pages/AccountPage";
import ShopSetupPage from "./pages/ShopSetupPage";
import WorkOrdersPage from "./pages/WorkOrdersPage";
function Gate({ children, mode }) {
  const { account, loading, error, refresh } = useAuth();
  if (loading)
    return (
      <main className="route-state" role="status">
        Opening your workspace…
      </main>
    );
  if (error)
    return (
      <main className="route-state">
        <h1>Unable to connect</h1>
        <p role="alert">{error}</p>
        <button
          className="button button-primary"
          onClick={() => void refresh()}
        >
          Try again
        </button>
        <Link to="/">Back to homepage</Link>
      </main>
    );
  if (mode === "guest")
    return account ? <Navigate to={destination(account)} replace /> : children;
  if (!account) return <Navigate to="/sign-in" replace />;
  if (mode === "setup" && account.shop)
    return <Navigate to="/work-orders" replace />;
  if (mode === "workspace" && !account.shop)
    return <Navigate to="/setup/shop" replace />;
  return children;
}
function PageEffects() {
  const { pathname } = useLocation();
  useEffect(() => {
    const names = {
      "/": "Your digital workbench",
      "/create-account": "Create account",
      "/sign-in": "Sign in",
      "/setup/shop": "Name your shop",
      "/work-orders": "Work orders",
    };
    document.title =
      (names[pathname] ?? "Page not found") + " — Repair Shop Manager";
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageEffects />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/create-account"
            element={
              <Gate mode="guest">
                <AccountPage key="register" register />
              </Gate>
            }
          />
          <Route
            path="/sign-in"
            element={
              <Gate mode="guest">
                <AccountPage key="sign-in" />
              </Gate>
            }
          />
          <Route
            path="/setup/shop"
            element={
              <Gate mode="setup">
                <ShopSetupPage />
              </Gate>
            }
          />
          <Route
            path="/work-orders"
            element={
              <Gate mode="workspace">
                <WorkOrdersPage />
              </Gate>
            }
          />
          <Route
            path="*"
            element={
              <main className="route-state">
                <h1>Page not found</h1>
                <Link className="button button-primary" to="/">
                  Back to homepage
                </Link>
              </main>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
export { App as default };
