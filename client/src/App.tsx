import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import Home from "./pages/home";
import HotelBookingPage from "./pages/hotel-booking-page";
import SpaBookingPage from "./pages/spa-booking-page";
import RestaurantBookingPage from "./pages/restaurant-booking-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hotel-booking" component={HotelBookingPage} />
      <Route path="/spa-booking" component={SpaBookingPage} />
      <Route path="/restaurant-booking" component={RestaurantBookingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-20">
          <Router />
        </main>
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
