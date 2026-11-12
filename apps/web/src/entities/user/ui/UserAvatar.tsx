import type { User } from "../model/types";

export function UserAvatar({ user }: { user: User }) {
  return (
    <span
      title={user.name}
      className="inline-flex size-9 items-center justify-center rounded-full border text-sm font-semibold"
    >
      {user.name.charAt(0)}
    </span>
  );
}
