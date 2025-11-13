import React, { createContext, forwardRef, useContext, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const THEMES = { light: 'light', dark: 'dark' };

const ChartContext = createContext(null);

const useChart = () => {
  const context = useContext(ChartContext);
  if (!context) {
    throw new Error('useChart must be used within a ChartContainer');
  }
  return context;
};

const resolveColor = (configEntry, colorScheme) => {
  if (!configEntry) return undefined;
  if (configEntry.color) return configEntry.color;
  if (configEntry.theme && configEntry.theme[colorScheme]) {
    return configEntry.theme[colorScheme];
  }
  if (configEntry.theme && configEntry.theme.light) {
    return configEntry.theme.light;
  }
  return undefined;
};

const ChartContainer = forwardRef(
  (
    {
      config = {},
      colorScheme = THEMES.light,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const colors = useMemo(() => {
      return Object.entries(config).reduce((acc, [key, entry]) => {
        const resolved = resolveColor(entry, colorScheme);
        if (resolved) {
          acc[key] = resolved;
        }
        return acc;
      }, {});
    }, [config, colorScheme]);

    const value = useMemo(
      () => ({
        config,
        colorScheme,
        colors,
      }),
      [config, colorScheme, colors],
    );

    return (
      <ChartContext.Provider value={value}>
        <View ref={ref} style={[styles.container, style]} {...props}>
          {typeof children === 'function' ? children(value) : children}
        </View>
      </ChartContext.Provider>
    );
  },
);

ChartContainer.displayName = 'ChartContainer';

const ChartStyle = () => null;

const ChartTooltip = ({ visible = false, style, children, ...props }) => {
  if (!visible) return null;
  return (
    <View style={[styles.tooltip, style]} {...props}>
      {children}
    </View>
  );
};

const ChartTooltipContent = forwardRef(
  (
    {
      payload = [],
      label,
      hideLabel = false,
      hideIndicator = false,
      indicator = 'dot',
      nameKey,
      labelKey,
      formatter,
      labelFormatter,
      color,
      style,
      labelStyle,
      itemStyle,
    },
    ref,
  ) => {
    const { config, colors } = useChart();

    if (!payload.length) {
      return null;
    }

    const renderLabel = () => {
      if (hideLabel) return null;

      const primary = payload[0];
      const key = `${labelKey || primary.dataKey || primary.name || 'value'}`;
      const itemConfig = getPayloadConfig(config, primary, key);
      const value =
        (!labelKey &&
          typeof label === 'string' &&
          config[label]?.label) ||
        itemConfig?.label ||
        label;

      if (!value) return null;

      if (labelFormatter) {
        return (
          <Text style={[styles.tooltipLabel, labelStyle]}>
            {labelFormatter(value, payload)}
          </Text>
        );
      }

      return (
        <Text style={[styles.tooltipLabel, labelStyle]}>
          {String(value)}
        </Text>
      );
    };

    return (
      <View ref={ref} style={[styles.tooltip, style]}>
        {renderLabel()}
        <View style={styles.tooltipItems}>
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`;
            const itemConfig = getPayloadConfig(config, item, key);
            const indicatorColor =
              color || item.payload?.fill || item.color || colors[key];
            const value =
              typeof item.value === 'number'
                ? item.value.toLocaleString()
                : item.value;

            const content =
              formatter && item.value !== undefined && item.name
                ? formatter(
                    item.value,
                    item.name,
                    item,
                    index,
                    item.payload,
                  )
                : null;

            return (
              <View key={`${item.dataKey}-${index}`} style={[styles.tooltipItem, itemStyle]}>
                {!hideIndicator && (
                  <View
                    style={[
                      styles.indicator,
                      indicator === 'line' && styles.indicatorLine,
                      indicator === 'dashed' && styles.indicatorDashed,
                      { backgroundColor: indicatorColor, borderColor: indicatorColor },
                    ]}
                  />
                )}
                <View style={styles.tooltipItemContent}>
                  <Text style={styles.tooltipItemLabel}>
                    {itemConfig?.label || item.name}
                  </Text>
                  {content !== null ? (
                    content
                  ) : (
                    <Text style={styles.tooltipItemValue}>{value}</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  },
);

ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartLegend = ({ style, children, ...props }) => (
  <View style={[styles.legend, style]} {...props}>
    {children}
  </View>
);

const ChartLegendContent = forwardRef(
  (
    {
      payload = [],
      hideIcon = false,
      nameKey,
      style,
      itemStyle,
      labelStyle,
    },
    ref,
  ) => {
    const { config, colors } = useChart();

    if (!payload.length) return null;

    return (
      <View ref={ref} style={[styles.legend, style]}>
        {payload.map((item, index) => {
          const key = `${nameKey || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfig(config, item, key);
          const indicatorColor =
            item.color || colors[key] || '#71717a';

          return (
            <View key={`${item.value}-${index}`} style={[styles.legendItem, itemStyle]}>
              {!hideIcon && (
                <View
                  style={[
                    styles.legendIndicator,
                    { backgroundColor: indicatorColor },
                  ]}
                />
              )}
              <Text style={[styles.legendLabel, labelStyle]}>
                {itemConfig?.label || item.value || item.name}
              </Text>
            </View>
          );
        })}
      </View>
    );
  },
);

ChartLegendContent.displayName = 'ChartLegendContent';

const getPayloadConfig = (config, payload, key) => {
  if (!payload) return config[key];

  const rawPayload =
    typeof payload === 'object' &&
    payload !== null &&
    'payload' in payload &&
    typeof payload.payload === 'object'
      ? payload.payload
      : undefined;

  if (payload && typeof payload === 'object' && key in payload) {
    const value = payload[key];
    if (typeof value === 'string' && config[value]) {
      return config[value];
    }
  }

  if (rawPayload && key in rawPayload) {
    const value = rawPayload[key];
    if (typeof value === 'string' && config[value]) {
      return config[value];
    }
  }

  return config[key];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  tooltip: {
    minWidth: 160,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    backgroundColor: '#18181b',
    paddingHorizontal: 10,
    paddingVertical: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 6,
    gap: 8,
  },
  tooltipLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f8fafc',
  },
  tooltipItems: {
    gap: 6,
  },
  tooltipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 2,
    borderWidth: 1,
  },
  indicatorLine: {
    width: 2,
    height: 12,
    borderRadius: 1,
  },
  indicatorDashed: {
    width: 0,
    height: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  tooltipItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipItemLabel: {
    color: '#cbd5f5',
    fontSize: 12,
  },
  tooltipItemValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    fontSize: 12,
    color: '#cbd5f5',
  },
});

export {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
    ChartTooltip,
    ChartTooltipContent,
    useChart
};

