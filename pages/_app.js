import "@/styles/globals.css";
import { HeroUIProvider } from "@heroui/react";
import Header from '../components/Header';

export default function App({ Component, pageProps }) {
  return (
    <HeroUIProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
      </div>
    </HeroUIProvider>
  );
}
