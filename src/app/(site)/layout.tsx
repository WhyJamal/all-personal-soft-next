// The footer now lives in the root layout (hidden on /login and /register),
// so this group needs no layout of its own.
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <>{children}</>;
}
