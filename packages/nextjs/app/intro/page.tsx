import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DocumentArrowUpIcon, PaintBrushIcon, WindowIcon } from "@heroicons/react/20/solid";

async function setIntroCookie() {
  "use server";
  cookies().set("hasSeenIntro", "true", {
    expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 1000),
    maxAge: 60 * 60 * 24 * 365 * 1000,
  });
  redirect("/");
}

const features = [
  {
    name: "Browser Memory",
    description:
      "A Burner Wallet's private key is stored in your browser's memory. This means you can easily generate a new wallet just by opening a new incognito window!",
    icon: WindowIcon,
  },
  {
    name: "Export Private Key",
    description:
      "From the Settings drawer, you can easily copy your Burner Wallet's private key from the browser. To avoid losing your assets, be sure to backup your private key to a secure location.",
    icon: DocumentArrowUpIcon,
  },
  {
    name: "New Wallet, New Colors",
    description:
      "Every time you generate a new Burner Wallet, the gradient colors will change. The colors are generated from the private key, so they're unique to each Burner Wallet.",
    icon: PaintBrushIcon,
  },
];

export default function IntroPage() {
  return (
    <main className="bg-base-200 overflow-hidden">
      <div className="relative isolate">
        <div
          className="absolute left-1/2 right-0 top-0 -z-10 -ml-24 transform-gpu overflow-hidden blur-3xl lg:ml-24 xl:ml-48"
          aria-hidden="true"
        >
          <div
            className="aspect-[801/1036] w-[50.0625rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
            style={{
              clipPath:
                "polygon(63.1% 29.5%, 100% 17.1%, 76.6% 3%, 48.4% 0%, 44.6% 4.7%, 54.5% 25.3%, 59.8% 49%, 55.2% 57.8%, 44.4% 57.2%, 27.8% 47.9%, 35.1% 81.5%, 0% 97.7%, 39.2% 100%, 35.2% 81.4%, 97.2% 52.8%, 63.1% 29.5%)",
            }}
          />
        </div>
        <div className="overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 pb-32 pt-36 sm:pt-60 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
              <div className="relative w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
                <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">Burner Wallet</h1>
                <p className="mt-6 text-lg leading-8 sm:max-w-md lg:max-w-none">
                  A <strong>temporary</strong> crypto wallet to quickly send or receive assets on Ethereum and popular
                  Layer 2 chains.
                </p>

                <p className="mt-6 text-lg leading-8 sm:max-w-md lg:max-w-none">
                  With Burner Wallet, a private key is generated and stored in your browser. Be sure to securely backup
                  your private key if you receive real funds or assets!
                </p>

                <div className="mt-10 flex items-center gap-x-6">
                  <form action={setIntroCookie}>
                    <button className="btn btn-primary btn-lg" type="submit">
                      Generate Burner Wallet
                    </button>
                  </form>
                </div>
              </div>
              <div className="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0">
                <div className="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                </div>
                <div className="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1485217988980-11786ced9454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-x=.4&w=396&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                </div>
                <div className="w-44 flex-none space-y-8 pt-32 sm:pt-0">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=left&w=400&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1670272505284-8faba1c31f7d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
                      alt=""
                      className="aspect-[2/3] w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-900/10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-base-100 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-accent">Perfect for</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Quick, Isolated Transactions</p>
            <p className="mt-6 text-lg leading-8">
              Since your Burner Wallet is meant to be temporary, it&apos;s important to learn how to backup and manage
              your private key. Otherwise, your assets may be lost!
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map(feature => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <feature.icon className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-8 text-center">
            <form action={setIntroCookie}>
              <button className="btn btn-primary btn-lg" type="submit">
                Generate Burner Wallet
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
