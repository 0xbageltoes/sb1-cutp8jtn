export const getScenarioColor = (name: string): string => {
  const colors: { [key: string]: string } = {
    'Base': 'hsl(var(--chart-1))',
    'High Prepay': 'hsl(var(--chart-2))',
    'High Default': 'hsl(var(--chart-3))',
    'High Severity': 'hsl(var(--chart-4))',
    'Combined Stress': 'hsl(var(--chart-5))',
    'Fast Recovery': 'hsl(var(--chart-1))',
    'Slow Recovery': 'hsl(var(--chart-2))'
  }
  return colors[name] || 'hsl(var(--muted-foreground))'
}

export const getScenarioColorRGB = (name: string): string => {
  const colors: { [key: string]: string } = {
    'Base': 'rgb(var(--chart-1))',
    'High Prepay': 'rgb(var(--chart-2))',
    'High Default': 'rgb(var(--chart-3))',
    'High Severity': 'rgb(var(--chart-4))',
    'Combined Stress': 'rgb(var(--chart-5))',
    'Fast Recovery': 'rgb(var(--chart-1))',
    'Slow Recovery': 'rgb(var(--chart-2))'
  }
  return colors[name] || 'rgb(var(--muted-foreground))'
}