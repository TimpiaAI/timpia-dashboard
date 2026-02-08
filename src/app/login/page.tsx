"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LoginPage() {
  const [authKey, setAuthKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: authKey })
      })

      if (res.ok) {
        router.push('/')
        router.refresh()
      } else {
        setError('Invalid access key')
      }
    } catch {
      setError('Connection error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-foreground/5">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold tracking-wider text-white mb-2">
              TIMPIA
            </h1>
            <p className="text-xs text-muted-foreground">
              Enter your access key to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={authKey}
                onChange={(e) => setAuthKey(e.target.value)}
                placeholder="Access key"
                className="w-full rounded-lg border border-border/50 bg-transparent px-3 py-2.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-500">
                <AlertCircle className="h-3.5 w-3.5" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !authKey}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>

          <p className="text-[10px] text-muted-foreground text-center mt-6">
            dashboard.timpia.ai
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
