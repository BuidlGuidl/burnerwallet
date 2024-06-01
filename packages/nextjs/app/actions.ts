"use server";

import { cookies } from "next/headers";

export async function setIntroCookie() {
  "use server";
  cookies().set("hasSeenIntro", "true", {
    expires: new Date(Date.now() + 60 * 60 * 24 * 365 * 1000),
    maxAge: 60 * 60 * 24 * 365 * 1000,
  });
}
