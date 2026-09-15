export default function ChatLayout({ children }: React.PropsWithChildren) {
  return (
    <div className="flex h-0 min-h-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}
