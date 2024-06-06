import { cookies } from "next/headers";
import type { NextPage } from "next";
import Homepage from "~~/components/Homepage";

const Home: NextPage = () => {
  const cookieStore = cookies();
  const hasSeenIntro = cookieStore.has("hasSeenIntro");

  return <Homepage hasSeenIntro={hasSeenIntro} />;
};

export default Home;
