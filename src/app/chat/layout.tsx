/** Locks chat to the viewport below the site header (h-14) so the composer stays visible. */
export default function ChatLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="flex max-h-[calc(100dvh-3.5rem)] min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}
