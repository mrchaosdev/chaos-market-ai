import { AppShell } from "@/components/layout/app-shell";

/**
 * The shell lives here rather than inside each page so it renders once and stays
 * mounted across navigations. When every page wrapped its own `AppShell`, the
 * `loading.tsx` fallback wrapped one too, so during the streaming window the
 * incoming page and the fallback both had a nav and a header in the DOM at the
 * same time — two 50px bars and, once the mobile menu existed, two menu buttons.
 * Barely visible at desktop widths; unmissable on a phone.
 */
export default function AppLayout({ children }: LayoutProps<"/app">) {
  return <AppShell>{children}</AppShell>;
}
