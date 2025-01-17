'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/supabase'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CashflowDashboard } from '@/components/cashflows/dashboard'

type Instrument = Database['public']['Tables']['instruments_primary']['Row']

export default function AnalyzePage() {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadInstruments() {
      const { data } = await supabase
        .from('instruments_primary')
        .select('*')
      if (data) {
        setInstruments(data)
      }
      setLoading(false)
    }
    loadInstruments()
  }, [])

  const handleInstrumentChange = async (id: string) => {
    const { data } = await supabase
      .from('instruments_primary')
      .select('*')
      .eq('id', id)
      .single()
    if (data) {
      setSelectedInstrument(data)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid gap-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Select onValueChange={handleInstrumentChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select instrument" />
        </SelectTrigger>
        <SelectContent>
          {instruments.map((instrument) => (
            <SelectItem key={instrument.id} value={instrument.id}>
              {instrument.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedInstrument && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="evaluate">Evaluate</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="triggers">Triggers/Cov</TabsTrigger>
            <TabsTrigger value="hist">Hist Cash Flows</TabsTrigger>
            <TabsTrigger value="collateral">Collateral Perf</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2">Terms</h3>
                  <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <div className="text-muted-foreground">Current Balance</div>
                    <div className="text-right">{selectedInstrument.current_balance || 'N/A'}</div>
                    <div className="text-muted-foreground">Interest Rate</div>
                    <div className="text-right">{selectedInstrument.interest_rate || 'N/A'}</div>
                    <div className="text-muted-foreground">Stated Rate</div>
                    <div className="text-right">{selectedInstrument.stated_rate || 'N/A'}</div>
                    <div className="text-muted-foreground">Penalty Rate</div>
                    <div className="text-right">{selectedInstrument.penalty_rate || 'N/A'}</div>
                    <div className="text-muted-foreground">Rate Type</div>
                    <div className="text-right">{selectedInstrument.rate_type || 'N/A'}</div>
                    <div className="text-muted-foreground">Rate Floor</div>
                    <div className="text-right">{selectedInstrument.rate_floor || 'N/A'}</div>
                    <div className="text-muted-foreground">Term</div>
                    <div className="text-right">{selectedInstrument.term || 'N/A'}</div>
                    <div className="text-muted-foreground">Remaining Term</div>
                    <div className="text-right">{selectedInstrument.remaining_term || 'N/A'}</div>
                    <div className="text-muted-foreground">Payment Day</div>
                    <div className="text-right">{selectedInstrument.payment_day || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2">Collateral</h3>
                  <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <div className="text-muted-foreground">Collateral</div>
                    <div className="text-right">{selectedInstrument.collateral || 'N/A'}</div>
                    <div className="text-muted-foreground">Collateral Type</div>
                    <div className="text-right">{selectedInstrument.collateral_type || 'N/A'}</div>
                    <div className="text-muted-foreground">Lien Status</div>
                    <div className="text-right">{selectedInstrument.lien_status || 'N/A'}</div>
                    <div className="text-muted-foreground">Lien Jurisdiction</div>
                    <div className="text-right">{selectedInstrument.lien_jurisdiction || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2">Status & Dates</h3>
                  <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <div className="text-muted-foreground">Status</div>
                    <div className="text-right">{selectedInstrument.status || 'N/A'}</div>
                    <div className="text-muted-foreground">Start Date</div>
                    <div className="text-right">{selectedInstrument.start_date || 'N/A'}</div>
                    <div className="text-muted-foreground">Maturity Date</div>
                    <div className="text-right">{selectedInstrument.maturity_date || 'N/A'}</div>
                    <div className="text-muted-foreground">Next Payment</div>
                    <div className="text-right">{selectedInstrument.next_payment || 'N/A'}</div>
                    <div className="text-muted-foreground">Origination Date</div>
                    <div className="text-right">{selectedInstrument.origination_date || 'N/A'}</div>
                    <div className="text-muted-foreground">Purchase Date</div>
                    <div className="text-right">{selectedInstrument.purchase_date || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2">Servicing</h3>
                  <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <div className="text-muted-foreground">Servicer</div>
                    <div className="text-right">{selectedInstrument.servicer || 'N/A'}</div>
                    <div className="text-muted-foreground">Subservicer</div>
                    <div className="text-right">{selectedInstrument.subservicer || 'N/A'}</div>
                    <div className="text-muted-foreground">Originator</div>
                    <div className="text-right">{selectedInstrument.originator || 'N/A'}</div>
                    <div className="text-muted-foreground">Originator Parent</div>
                    <div className="text-right">{selectedInstrument.originator_parent || 'N/A'}</div>
                    <div className="text-muted-foreground">Channel</div>
                    <div className="text-right">{selectedInstrument.channel || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2">Risk & Modifications</h3>
                  <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <div className="text-muted-foreground">Risk Score</div>
                    <div className="text-right">{selectedInstrument.risk_score || 'N/A'}</div>
                    <div className="text-muted-foreground">Default Rate</div>
                    <div className="text-right">{selectedInstrument.default_rate || 'N/A'}</div>
                    <div className="text-muted-foreground">Total Modifications</div>
                    <div className="text-right">{selectedInstrument.total_modifications || 'N/A'}</div>
                    <div className="text-muted-foreground">Modification %</div>
                    <div className="text-right">{selectedInstrument.modification_percent || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-2">Legal</h3>
                  <div className="grid grid-cols-2 gap-x-4 text-sm">
                    <div className="text-muted-foreground">Agreement Type</div>
                    <div className="text-right">{selectedInstrument.agreement_type || 'N/A'}</div>
                    <div className="text-muted-foreground">Governing Law</div>
                    <div className="text-right">{selectedInstrument.governing_law || 'N/A'}</div>
                    <div className="text-muted-foreground">Amortization Type</div>
                    <div className="text-right">{selectedInstrument.amortization_type || 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="evaluate">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-4">Forecast Inputs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs">Prepayment Type</Label>
                      <Select defaultValue="CPR">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CPR">CPR</SelectItem>
                          <SelectItem value="SMM">SMM</SelectItem>
                          <SelectItem value="PSA">PSA</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Prepay Rate (%)</Label>
                      <Input type="number" defaultValue="0" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Default Type</Label>
                      <Select defaultValue="CDR">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CDR">CDR</SelectItem>
                          <SelectItem value="MDR">MDR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Default Rate (%)</Label>
                      <Input type="number" defaultValue={selectedInstrument.default_rate || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Loss Severity (%)</Label>
                      <Input type="number" defaultValue="35" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Recovery Lag (months)</Label>
                      <Input type="number" defaultValue="12" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Interest Rate (%)</Label>
                      <Input type="number" defaultValue={selectedInstrument.interest_rate || selectedInstrument.stated_rate || "0"} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Rate Floor (%)</Label>
                      <Input type="number" defaultValue={selectedInstrument.rate_floor || "0"} />
                    </div>
                  </div>
                  <Button className="w-full mt-4">Generate Forecast</Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-sm mb-4">Forecast Results</h3>
                  <CashflowDashboard />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="market">
            <div className="text-center text-muted-foreground">
              Market tab content
            </div>
          </TabsContent>

          <TabsContent value="triggers">
            <div className="text-center text-muted-foreground">
              Triggers/Cov tab content
            </div>
          </TabsContent>

          <TabsContent value="hist">
            <div className="text-center text-muted-foreground">
              Historical Cash Flows tab content
            </div>
          </TabsContent>

          <TabsContent value="collateral">
            <div className="text-center text-muted-foreground">
              Collateral Performance tab content
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}