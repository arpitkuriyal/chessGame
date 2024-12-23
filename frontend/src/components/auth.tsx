import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

export default function Auth() {
  return (
    <header className="bg-green-500 rounded-md px-2 py-1 font-bold m-1">
      <SignedOut>
          <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  );
}