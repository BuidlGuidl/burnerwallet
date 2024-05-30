import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextPage } from "next";
import Homepage from "~~/components/Homepage";

const Home: NextPage = () => {
  const cookieStore = cookies();
  const hasSeenIntro = cookieStore.has("hasSeenIntro");

  if (!hasSeenIntro) {
    redirect("/intro");
  }

  return <Homepage />;
};

export default Home;
