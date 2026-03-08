import { AuthPortal, AuthSplash } from "@/features/auth/components";

export default function LoginPage() {
  return (
    <AuthSplash>
      <AuthPortal />
    </AuthSplash>
  );
}
