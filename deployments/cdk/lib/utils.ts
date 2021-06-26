import * as cloudwatch from '@aws-cdk/aws-cloudwatch'
import * as cdk from '@aws-cdk/core'

export const requiredEnv = (varKey: string): string => {
  const varValue = process.env[varKey]

  if (!varValue) throw new Error(`${varKey} is required`)

  return varValue
}

export const fromEnv = <K extends string>(
  requirements: Record<K, string>
): Record<K, string> => {
  return Object.keys(requirements).reduce<Record<K, string>>((acc, key) => {
    const value = requirements[key as K]
    return {
      ...acc,
      [key]: process.env[value],
    }
  }, {} as Record<K, string>)
}

export const ifEmtpy = (valueA: string, valueB: string): string => valueA !== '' ? valueA : valueB

export const buildGraphWidget = (widgetName: string, metrics: cloudwatch.IMetric[], stacked = false): cloudwatch.GraphWidget => {
  return new cloudwatch.GraphWidget({
    title: widgetName,
    left: metrics,
    stacked: stacked,
    width: 8
  })
}

export const metricForApiGw = (apiId: string, metricName: string, label: string, stat = 'avg'): cloudwatch.Metric => {
  const dimensions = {
    ApiId: apiId
  }
  return buildMetric(metricName, 'AWS/ApiGateway', dimensions, cloudwatch.Unit.COUNT, label, stat)
}

export const buildMetric = (metricName: string, namespace: string, dimensions: any, unit: cloudwatch.Unit, label: string, stat = 'avg', period = 900): cloudwatch.Metric => {
  return new cloudwatch.Metric({
    metricName,
    namespace: namespace,
    dimensions: dimensions,
    unit: unit,
    label: label,
    statistic: stat,
    period: cdk.Duration.seconds(period)
  })
}
