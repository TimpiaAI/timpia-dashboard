"use client"

import { useState, useRef } from 'react'
import { Brain, Link2, UploadCloud, ClipboardList, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const WEBHOOK_URL = 'https://n8n-mui5.onrender.com/webhook/9ce8d3aa-6843-4c15-ba89-7d610083d709'
const CLIENT_ID = 'MarketManager'

const ModeBadge = ({ step }: { step: number }) => (
  <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
    Mode {step}
  </span>
)

const TrainingCard = ({
  step,
  icon: Icon,
  title,
  description,
  children,
}: {
  step: number
  icon: React.ElementType
  title: string
  description: string
  children: React.ReactNode
}) => (
  <Card className="h-full border border-border/40 shadow-sm transition hover:shadow-md">
    <CardHeader className="pb-4">
      <div className="flex items-start justify-between gap-4">
        <ModeBadge step={step} />
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <CardTitle className="text-lg">{title}</CardTitle>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
)

export default function TrainingPage() {
  const { toast } = useToast()

  // Website URL form state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [websiteNotes, setWebsiteNotes] = useState('')
  const [isSubmittingUrl, setIsSubmittingUrl] = useState(false)

  // File upload form state
  const [trainingFile, setTrainingFile] = useState<File | null>(null)
  const [isSubmittingFile, setIsSubmittingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Text form state
  const [trainingText, setTrainingText] = useState('')
  const [isSubmittingText, setIsSubmittingText] = useState(false)

  const handleWebsiteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!websiteUrl.trim()) {
      toast({ title: 'URL required', description: 'Enter a complete web address before submitting.', variant: 'destructive' })
      return
    }

    setIsSubmittingUrl(true)
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: CLIENT_ID,
          sourceType: 'website',
          url: websiteUrl.trim(),
          notes: websiteNotes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Failed to submit URL.')
      }

      toast({ title: 'URL submitted', description: 'The web address has been sent for chatbot training.' })
      setWebsiteUrl('')
      setWebsiteNotes('')
    } catch (error: any) {
      toast({ title: 'Submission error', description: error.message || 'Could not submit URL.', variant: 'destructive' })
    } finally {
      setIsSubmittingUrl(false)
    }
  }

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trainingFile) {
      toast({ title: 'Select a file', description: 'Choose a PDF, Word or Excel file to upload.', variant: 'destructive' })
      return
    }

    setIsSubmittingFile(true)
    try {
      const formData = new FormData()
      formData.append('clientId', CLIENT_ID)
      formData.append('sourceType', 'file')
      formData.append('file', trainingFile)
      const fileExtension = trainingFile.name.split('.').pop()?.toLowerCase() ?? ''
      formData.append('originalFilename', trainingFile.name)
      if (fileExtension) {
        formData.append('fileExtension', fileExtension)
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'File upload failed.')
      }

      toast({ title: 'File submitted', description: `${trainingFile.name} has been sent for training.` })
      setTrainingFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      toast({ title: 'Upload error', description: error.message || 'Could not submit file.', variant: 'destructive' })
    } finally {
      setIsSubmittingFile(false)
    }
  }

  const handleTextSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!trainingText.trim()) {
      toast({ title: 'Text required', description: 'Add content for the chatbot to learn.', variant: 'destructive' })
      return
    }

    setIsSubmittingText(true)
    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: CLIENT_ID,
          sourceType: 'text',
          content: trainingText.trim(),
        }),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Text submission failed.')
      }

      toast({ title: 'Content submitted', description: 'The text has been sent for training.' })
      setTrainingText('')
    } catch (error: any) {
      toast({ title: 'Submission error', description: error.message || 'Could not submit text.', variant: 'destructive' })
    } finally {
      setIsSubmittingText(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          Train Chatbot
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Submit content to train the MarketManager chatbot. Send one type of information at a time.
        </p>
      </div>

      {/* Header Card */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 mb-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Knowledge Base Training
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add websites, documents, or text content to enhance the chatbot&apos;s knowledge.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-primary/30 bg-background/70 px-4 py-1 text-xs font-semibold text-primary">
            Client: {CLIENT_ID}
          </span>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-foreground/80 list-disc list-inside">
          <li><strong>URL Mode:</strong> Submit the main page or a content-rich section of a website.</li>
          <li><strong>Document Mode:</strong> Upload PDF, Word, Excel or CSV files with detailed information.</li>
          <li><strong>Text Mode:</strong> Paste scripts, procedures, or important descriptions directly.</li>
        </ul>
      </div>

      {/* Training Cards Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* URL Form */}
        <TrainingCard
          step={1}
          icon={Link2}
          title="Submit a Website URL"
          description="We will automatically crawl the page to extract relevant content."
        >
          <form onSubmit={handleWebsiteSubmit} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="training-url">Complete URL</Label>
                <Input
                  id="training-url"
                  type="url"
                  inputMode="url"
                  required
                  placeholder="https://example.com/page"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Include the protocol (https://) and verify the page is publicly accessible.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="training-url-notes">Notes (optional)</Label>
                <Textarea
                  id="training-url-notes"
                  placeholder="E.g.: This page contains tutorials for the inventory module."
                  value={websiteNotes}
                  onChange={(e) => setWebsiteNotes(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Briefly describe what content this URL provides or how it should be used.
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingUrl}>
              {isSubmittingUrl ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit URL'
              )}
            </Button>
          </form>
        </TrainingCard>

        {/* File Form */}
        <TrainingCard
          step={2}
          icon={UploadCloud}
          title="Upload a File"
          description="Add operational documents, offers, technical sheets, or exported reports."
        >
          <form onSubmit={handleFileSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training-file">Choose file</Label>
              <Input
                id="training-file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                ref={fileInputRef}
                onChange={(e) => setTrainingFile(e.target.files?.[0] || null)}
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: PDF, DOCX, XLSX or CSV. Submit one file per session.
              </p>
              {trainingFile && (
                <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-foreground/80">
                  <p className="font-medium">{trainingFile.name}</p>
                  <p>{(trainingFile.size / 1024).toFixed(1)} KB</p>
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingFile || !trainingFile}>
              {isSubmittingFile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Submit File'
              )}
            </Button>
          </form>
        </TrainingCard>

        {/* Text Form */}
        <TrainingCard
          step={3}
          icon={ClipboardList}
          title="Add Content Manually"
          description="Ideal for short snippets: standard responses, sales messages, or internal procedures."
        >
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training-text">Text for the chatbot to learn</Label>
              <Textarea
                id="training-text"
                placeholder="Paste product descriptions, procedures, or other useful information here..."
                minLength={20}
                rows={6}
                value={trainingText}
                onChange={(e) => setTrainingText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Tip: Divide content into logical paragraphs for better accuracy.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmittingText || !trainingText.trim()}>
              {isSubmittingText ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Text'
              )}
            </Button>
          </form>
        </TrainingCard>
      </div>
    </div>
  )
}
