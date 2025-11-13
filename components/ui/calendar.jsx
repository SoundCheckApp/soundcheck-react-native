import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';

/**
 * React Native calendar component powered by react-native-calendars.
 * Mirrors the capabilities of the original DayPicker-based web component
 * with themed styling and customizable marked dates.
 */
const Calendar = ({
  current,
  minDate,
  maxDate,
  markedDates = {},
  onDayPress,
  onDayLongPress,
  onMonthChange,
  firstDay = 0,
  enableSwipeMonths = true,
  hideArrows = false,
  hideExtraDays = false,
  theme,
  style,
  ...props
}) => {
  const mergedTheme = useMemo(
    () => ({
      backgroundColor: '#0f0f23',
      calendarBackground: '#111827',
      textSectionTitleColor: '#a1a1aa',
      selectedDayBackgroundColor: '#6366f1',
      selectedDayTextColor: '#ffffff',
      todayTextColor: '#f97316',
      dayTextColor: '#e4e4e7',
      textDisabledColor: '#4b5563',
      arrowColor: '#a1a1aa',
      monthTextColor: '#f5f5f5',
      textMonthFontSize: 16,
      textMonthFontWeight: '600',
      textDayFontSize: 14,
      textDayHeaderFontSize: 12,
      dotColor: '#6366f1',
      selectedDotColor: '#ffffff',
      'stylesheet.day.basic': {
        base: {
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
        },
      },
      ...theme,
    }),
    [theme],
  );

  return (
    <View style={[styles.container, style]}>
      <RNCalendar
        current={current}
        minDate={minDate}
        maxDate={maxDate}
        markedDates={markedDates}
        onDayPress={onDayPress}
        onDayLongPress={onDayLongPress}
        onMonthChange={onMonthChange}
        firstDay={firstDay}
        enableSwipeMonths={enableSwipeMonths}
        hideArrows={hideArrows}
        hideExtraDays={hideExtraDays}
        renderArrow={(direction) =>
          direction === 'left' ? (
            <ChevronLeft size={20} color={mergedTheme.arrowColor} />
          ) : (
            <ChevronRight size={20} color={mergedTheme.arrowColor} />
          )
        }
        theme={mergedTheme}
        {...props}
      />
    </View>
  );
};

Calendar.displayName = 'Calendar';

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
  },
});

export { Calendar };

