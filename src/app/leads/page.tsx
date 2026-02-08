"use client"

import { useEffect, useState } from "react"
import { Search, RefreshCw, Mail, Phone, Building2, MapPin, User, Calendar, AlertCircle, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Lead {
  _id: string
  clientId?: string
  nume_complet?: string
  firma?: string
  nr_locatii?: string
  email?: string
  telefon?: string
  telefon_whatsapp?: string
  functionalitati_dorite?: string
  alte_nevoi?: string | null
  createdAt?: string
  source?: string
  type?: 'lead' | 'ticket'
  trial_interest?: boolean
  consent_forward?: boolean
  issue_summary?: string
  category?: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const fetchLeads = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: '100',
        ...(search && { search })
      })
      const res = await fetch(`/api/leads?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLeads(data.leads || [])
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLeads()
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Leads List */}
      <div className={`w-full md:w-96 border-r border-border/50 flex flex-col bg-background ${selectedLead ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-border/50 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-medium">Leads</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={fetchLeads}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          <form onSubmit={handleSearch} className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border/50 bg-transparent pl-8 pr-3 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20"
              />
            </div>
            <Button type="submit" size="sm" className="w-full h-7 text-xs">
              Search
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground text-sm">
              Loading...
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <div className="space-y-1 p-2">
              {leads.map((lead) => (
                <button
                  key={lead._id}
                  onClick={() => setSelectedLead(lead)}
                  className={`w-full flex flex-col gap-1 rounded-xl p-3 text-left transition-all ${
                    selectedLead?._id === lead._id
                      ? "bg-foreground/5 border border-foreground/10"
                      : "hover:bg-foreground/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {lead.type === 'ticket' ? (
                        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-orange-500/10 text-orange-500 rounded">
                          Ticket
                        </span>
                      ) : (
                        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/10 text-blue-500 rounded">
                          Lead
                        </span>
                      )}
                      <span className="font-medium text-sm truncate">
                        {lead.nume_complet || 'Fara nume'}
                      </span>
                    </div>
                    {lead.createdAt && (
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatDate(lead.createdAt)}
                      </span>
                    )}
                  </div>
                  {lead.firma && (
                    <span className="text-xs text-muted-foreground truncate">
                      {lead.firma}
                    </span>
                  )}
                  {lead.category && (
                    <span className="text-xs text-orange-400 truncate">
                      {lead.category}
                    </span>
                  )}
                  <div className="flex items-center gap-3 mt-1">
                    {lead.email && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {lead.email}
                      </span>
                    )}
                  </div>
                </button>
              ))}
              {leads.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No leads found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!loading && (
          <div className="p-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {leads.length} leads
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Lead Detail */}
      <div className={`flex-1 bg-card/50 ${!selectedLead ? 'hidden md:flex' : 'flex'} flex-col`}>
        {selectedLead ? (
          <>
            {/* Mobile back button */}
            <div className="md:hidden sticky top-0 z-10 bg-background border-b border-border/50 px-4 py-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to list
              </button>
            </div>

            <div className="p-6 overflow-auto">
              <div className="max-w-2xl">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {selectedLead.type === 'ticket' ? (
                        <span className="px-2 py-0.5 text-xs font-medium bg-orange-500/10 text-orange-500 rounded">
                          Ticket
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-500 rounded">
                          Lead
                        </span>
                      )}
                      {selectedLead.category && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded">
                          {selectedLead.category}
                        </span>
                      )}
                      {selectedLead.trial_interest && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-green-500/10 text-green-500 rounded">
                          Trial
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-semibold">
                      {selectedLead.nume_complet || 'Lead'}
                    </h2>
                    {selectedLead.firma && (
                      <p className="text-muted-foreground mt-1">{selectedLead.firma}</p>
                    )}
                  </div>
                  {selectedLead.createdAt && (
                    <div className="text-right text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {formatDate(selectedLead.createdAt)}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className="bg-background rounded-lg border border-border/50 p-4">
                    <h3 className="text-sm font-medium mb-3">Contact</h3>
                    <div className="space-y-3">
                      {selectedLead.email && (
                        <div className="flex items-center gap-3">
                          <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`mailto:${selectedLead.email}`} className="text-sm hover:underline">
                            {selectedLead.email}
                          </a>
                        </div>
                      )}
                      {(selectedLead.telefon || selectedLead.telefon_whatsapp) && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a href={`tel:${selectedLead.telefon || selectedLead.telefon_whatsapp}`} className="text-sm hover:underline">
                            {selectedLead.telefon || selectedLead.telefon_whatsapp}
                          </a>
                        </div>
                      )}
                      {selectedLead.firma && (
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{selectedLead.firma}</span>
                        </div>
                      )}
                      {selectedLead.nr_locatii && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm">{selectedLead.nr_locatii} locatii</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Issue Summary (for tickets) */}
                  {selectedLead.issue_summary && (
                    <div className="bg-orange-500/5 rounded-lg border border-orange-500/20 p-4">
                      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Problema Raportata
                      </h3>
                      <p className="text-sm whitespace-pre-wrap">{selectedLead.issue_summary}</p>
                    </div>
                  )}

                  {/* Needs */}
                  {(selectedLead.functionalitati_dorite || selectedLead.alte_nevoi) && (
                    <div className="bg-background rounded-lg border border-border/50 p-4">
                      <h3 className="text-sm font-medium mb-3">Nevoi</h3>
                      <div className="space-y-3">
                        {selectedLead.functionalitati_dorite && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Functionalitati dorite</p>
                            <p className="text-sm">{selectedLead.functionalitati_dorite}</p>
                          </div>
                        )}
                        {selectedLead.alte_nevoi && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Alte nevoi</p>
                            <p className="text-sm">{selectedLead.alte_nevoi}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="bg-background rounded-lg border border-border/50 p-4">
                    <h3 className="text-sm font-medium mb-3">Info</h3>
                    <div className="space-y-2 text-xs">
                      {selectedLead.clientId && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Client ID</span>
                          <span className="font-mono">{selectedLead.clientId}</span>
                        </div>
                      )}
                      {selectedLead.source && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sursa</span>
                          <span>{selectedLead.source}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ID</span>
                        <span className="font-mono text-[10px]">{selectedLead._id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Select a lead</p>
              <p className="text-sm mt-1">Choose a lead from the list to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
