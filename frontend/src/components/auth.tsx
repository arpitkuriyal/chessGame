import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

function SignedInAccount() {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.firstName ?? "");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const saveDisplayName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = displayName.trim();
    if (!name || !user) {
      setError("Enter a display name to continue.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await user.update({ firstName: name });
      setIsEditing(false);
    } catch {
      setError("We couldn't save your display name. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex items-center gap-3 text-white">
      <Link to="/history" className="text-sm hover:text-green-200">
        History
      </Link>
      <span className="hidden text-sm sm:inline">
        {user?.firstName || "Choose a display name"}
      </span>
      <button
        type="button"
        onClick={() => {
          setDisplayName(user?.firstName ?? "");
          setError("");
          setIsEditing((editing) => !editing);
        }}
        className="rounded-md border border-white/30 px-3 py-2 text-sm hover:bg-white/10"
      >
        {user?.firstName ? "Edit name" : "Set display name"}
      </button>
      <UserButton />

      {isEditing && (
        <div className="absolute right-0 top-12 z-20 w-72 rounded-lg border border-zinc-200 bg-white p-4 text-zinc-900 shadow-xl">
          <form onSubmit={saveDisplayName} className="flex flex-col gap-3">
            <label htmlFor="display-name" className="text-sm font-semibold">
              Display name
            </label>
            <input
              id="display-name"
              autoFocus
              maxLength={40}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 outline-none focus:border-green-700"
              placeholder="How should other players see you?"
            />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-60"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function Auth() {
  return (
    <header className="m-1 flex items-center gap-2 rounded-md px-2 py-1 font-bold">
      <SignedOut>
        <SignInButton>
          <button className="rounded-md border border-white/40 px-4 py-2 text-sm text-white hover:bg-white/10">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton>
          <button className="rounded-md bg-green-700 px-4 py-2 text-sm text-white hover:bg-green-800">
            Create account
          </button>
        </SignUpButton>
      </SignedOut>
      <SignedIn>
        <SignedInAccount />
      </SignedIn>
    </header>
  );
}
