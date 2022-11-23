import { AppProps } from "next/app";
import MainLayout from "../components/layouts/main";
import "../styles/global.css";

function App({ Component, pageProps }: AppProps) {
  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}

export default App;
