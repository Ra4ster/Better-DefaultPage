import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Start() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-3xl font-semibold">Make every new tab useful.</h1>
        <p className="mt-3 text-muted-foreground">
          A clean default page with headlines, notes, and quick links.
        </p>

        <div className="mt-6 grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">1) Use it right now</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              Open your dashboard:{" "}
              <a href="/" className="underline underline-offset-4">
                Go to Better DefaultPage →
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                2) Set it as your startup / home page
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div>
                <div className="font-medium text-foreground">Chrome</div>
                Settings → On startup → Open a specific page → Add this URL.
              </div>
              <div>
                <div className="font-medium text-foreground">Edge</div>
                Settings → Start, home, and new tabs → When Edge starts → Open
                these pages.
              </div>
              <div>
                <div className="font-medium text-foreground">Firefox</div>
                Settings → Home → Homepage and new windows → Custom URLs.
              </div>
              <div className="pt-2">
                Tip: Bookmark this page too — it works great as a pinned tab.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">3) Done</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              You can customize links and your notepad next.
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}