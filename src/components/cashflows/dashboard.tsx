'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { getScenarioColor } from '@/lib/cashflows/colors'


interface CashflowData {
  period: number
  scheduledPrincipal: number
  scheduledInterest: number
  prepayments: number
  losses: number
  recoveries: number
}

interface ScenarioResult {
  name: string
  cashflows: CashflowData[]
  metrics: {
    waf: number
    modifiedDuration: number
    yield: number
  }
}

interface CashflowDashboardProps {
  scenarios?: ScenarioResult[]
  onScenarioSelect?: (scenario: string) => void
  onPeriodSelect?: (period: number) => void
}

interface MetricItem {
  name: string
  waf: string
  duration: string
  yield: string
}

const CashflowDashboard = ({
  scenarios = [],
  onScenarioSelect,
  onPeriodSelect
}: CashflowDashboardProps) => {
  const [selectedMetric, setSelectedMetric] = useState<'principal' | 'interest' | 'losses'>('principal')
  const [showCumulative, setShowCumulative] = useState(false)

  const chartData = useMemo(() => {
    if (!scenarios.length) return []

    return scenarios.map(scenario => {
      if (!scenario?.cashflows) return []

      let cumulative = 0
      return scenario.cashflows.map(cf => {
        if (!cf) return null

        const value = selectedMetric === 'principal' ? 
          (cf.scheduledPrincipal || 0) + (cf.prepayments || 0) :
          selectedMetric === 'interest' ? 
            (cf.scheduledInterest || 0) :
            (cf.losses || 0)

        cumulative += value
        return {
          period: cf.period,
          [scenario.name]: showCumulative ? cumulative : value
        }
      }).filter(Boolean)
    }).reduce((merged, current) => {
      current.forEach((point, i) => {
        if (point) {
          merged[i] = { ...merged[i], ...point }
        }
      })
      return merged
    }, [])
  }, [scenarios, selectedMetric, showCumulative])

  
const metrics = useMemo((): MetricItem[] => {
  if (!scenarios.length) return []

  return scenarios
    .map(s => {
      if (!s?.metrics) return null
      
      return {
        name: s.name,
        waf: s.metrics.waf?.toFixed(2) || '0.00',
        duration: s.metrics.modifiedDuration?.toFixed(2) || '0.00',
        yield: s.metrics.yield?.toFixed(2) || '0.00'
      }
    })
    .filter((m): m is MetricItem => m !== null)
}, [scenarios])

  const handleScenarioClick = useCallback((scenario: string) => {
    onScenarioSelect?.(scenario)
  }, [onScenarioSelect])

  if (!scenarios.length) {
    return (
      <div className="w-full p-4">
        <Alert>
          <AlertDescription>
            No scenario data available. Please select or generate scenarios.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Controls */}
      <Card>
        <CardContent className="flex items-center space-x-6 py-6">
          <div className="space-y-2">
            <Label>Metric</Label>
            <Select
              value={selectedMetric}
              onValueChange={(value) => setSelectedMetric(value as any)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="principal">Principal</SelectItem>
                <SelectItem value="interest">Interest</SelectItem>
                <SelectItem value="losses">Losses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="cumulative"
              checked={showCumulative}
              onCheckedChange={setShowCumulative}
            />
            <Label htmlFor="cumulative">Show Cumulative</Label>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="period" 
                  label={{ value: 'Period', position: 'bottom' }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  label={{ 
                    value: selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1), 
                    angle: -90, 
                    position: 'left' 
                  }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                {scenarios.map(s => (
                  <Line
                    key={s.name}
                    type="monotone"
                    dataKey={s.name}
                    stroke={getScenarioColor(s.name)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    onClick={() => handleScenarioClick(s.name)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Metrics Table */}
      {metrics.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scenario</TableHead>
                  <TableHead>WAF</TableHead>
                  <TableHead>Modified Duration</TableHead>
                  <TableHead>Yield</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                
{metrics.map((m) => (
  <TableRow
    key={m.name} // This will now work without type errors
    className="cursor-pointer"
    onClick={() => handleScenarioClick(m.name)}
  >
    <TableCell className="font-medium">{m.name}</TableCell>
    <TableCell>{m.waf}</TableCell>
    <TableCell>{m.duration}</TableCell>
    <TableCell>{m.yield}</TableCell>
  </TableRow>
))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Alerts */}
      {scenarios.some(s => s.metrics?.waf < 2) && (
        <Alert>
          <AlertDescription>
            Warning: Some scenarios have a WAF less than 2 years, indicating potential rapid prepayment risk.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export { CashflowDashboard }