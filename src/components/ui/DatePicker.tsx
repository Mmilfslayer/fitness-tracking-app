/**
 * Apple HIG Compliant Date Picker Component
 * iOS-style date picker with wheel interface
 */

import React, { forwardRef, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { componentTokens, fontSize, fontWeight, spacing, colors, borderRadius, shadow } from '../../design/tokens';

export interface DatePickerProps {
  /** Selected date */
  value?: Date;
  /** Change handler */
  onChange?: (date: Date) => void;
  /** Minimum date */
  minDate?: Date;
  /** Maximum date */
  maxDate?: Date;
  /** Picker mode */
  mode?: 'date' | 'time' | 'datetime' | 'month' | 'year';
  /** Locale */
  locale?: string;
  /** Time zone */
  timeZone?: string;
  /** Minute interval */
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  /** Show in inline mode (not in bottom sheet) */
  inline?: boolean;
  /** Placeholder when no date selected */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
  /** Input className (for non-inline) */
  inputClassName?: string;
  /** Input style (for non-inline) */
  inputStyle?: React.CSSProperties;
  /** Accessibility label */
  'aria-label'?: string;
}

const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      minDate,
      maxDate,
      mode = 'date',
      locale = 'en-US',
      timeZone,
      minuteInterval = 1,
      inline = false,
      placeholder = 'Select date',
      disabled = false,
      className = '',
      style,
      inputClassName = '',
      inputStyle,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState<Date | null>(value ?? null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Use controlled or uncontrolled value
    const currentValue = value !== undefined ? value : internalValue;

    // Sync internal value with props
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Generate wheel data based on mode
    const wheelData = useMemo(() => {
      const now = currentValue || new Date();
      const min = minDate || new Date(1900, 0, 1);
      const max = maxDate || new Date(2100, 11, 31);

      switch (mode) {
        case 'date':
          return generateDateWheels(now, min, max, locale);
        case 'time':
          return generateTimeWheels(now, minuteInterval, locale);
        case 'datetime':
          return generateDateTimeWheels(now, min, max, minuteInterval, locale);
        case 'month':
          return generateMonthWheels(now, min, max, locale);
        case 'year':
          return generateYearWheels(now, min, max, locale);
        default:
          return generateDateWheels(now, min, max, locale);
      }
    }, [currentValue, minDate, maxDate, mode, locale, minuteInterval]);

    const handleValueChange = useCallback((newDate: Date) => {
      if (value === undefined) {
        setInternalValue(newDate);
      }
      onChange?.(newDate);
    }, [onChange, value]);

    const handleConfirm = useCallback(() => {
      if (!inline) {
        setIsOpen(false);
      }
    }, [inline]);

    const handleCancel = useCallback(() => {
      if (!inline) {
        setIsOpen(false);
      }
    }, [inline]);

    const handleInputClick = useCallback(() => {
      if (!disabled && !inline) {
        setIsOpen(true);
      }
    }, [disabled, inline]);

    // Format display value
    const formatDisplayValue = useCallback((date: Date | null) => {
      if (!date) return placeholder;

      const options: Intl.DateTimeFormatOptions = {};
      switch (mode) {
        case 'date':
          options.dateStyle = 'medium';
          break;
        case 'time':
          options.timeStyle = 'short';
          break;
        case 'datetime':
          options.dateStyle = 'medium';
          options.timeStyle = 'short';
          break;
        case 'month':
          options.month = 'long';
          options.year = 'numeric';
          break;
        case 'year':
          options.year = 'numeric';
          break;
      }

      return new Intl.DateTimeFormat(locale, options).format(date);
    }, [mode, locale, placeholder]);

    // Inline mode - render picker directly
    if (inline) {
      return (
        <div
          ref={ref}
          className={className}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[3],
            ...style,
          }}
          {...props}
        >
          <DatePickerWheel
            wheels={wheelData}
            onChange={handleValueChange}
            disabled={disabled}
          />
        </div>
      );
    }

    // Non-inline mode - render as input with bottom sheet
    return (
      <div
        ref={ref}
        className={className}
        style={{
          position: 'relative',
          width: '100%',
          ...style,
        }}
        {...props}
      >
        <input
          ref={inputRef}
          type="text"
          readOnly
          value={formatDisplayValue(currentValue)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClassName}
          style={{
            width: '100%',
            height: componentTokens.input.height,
            padding: componentTokens.input.padding,
            border: `1px solid var(--separator-opaque, ${colors.separator.opaque})`,
            borderRadius: componentTokens.input.borderRadius,
            backgroundColor: 'var(--system-background, #FFFFFF)',
            color: currentValue ? 'var(--label-primary, #000000)' : 'var(--placeholder-text, #3C3C434D)',
            fontSize: componentTokens.input.fontSize,
            fontFamily: 'inherit',
            outline: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            ...inputStyle,
          }}
          onClick={handleInputClick}
          onFocus={handleInputClick}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        />

        <BottomSheetDatePicker
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          wheels={wheelData}
          onChange={handleValueChange}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          disabled={disabled}
        />
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';

export default DatePicker;

/**
 * Bottom Sheet Date Picker (internal component)
 */
interface BottomSheetDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  wheels: WheelData[];
  onChange: (date: Date) => void;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const BottomSheetDatePicker = ({
  isOpen,
  onClose,
  wheels,
  onChange,
  onConfirm,
  onCancel,
  disabled,
}: BottomSheetDatePickerProps) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        exit={{ opacity: 0 }}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
        onClick={onClose}
      />

      {/* Picker Container */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          backgroundColor: 'var(--system-background, #FFFFFF)',
          borderRadius: `${borderRadius.continuous2xl} ${borderRadius.continuous2xl} 0 0`,
          boxShadow: shadow.level4,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '50vh',
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `${spacing[3]}px ${spacing[4]}px`,
            borderBottom: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            style={{
              padding: `${spacing[1]}px ${spacing[3]}px`,
              border: 'none',
              background: 'transparent',
              color: 'var(--system-blue, #007AFF)',
              fontSize: fontSize.body.size,
              fontWeight: fontWeight.regular,
              fontFamily: 'inherit',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.4 : 1,
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            style={{
              padding: `${spacing[1]}px ${spacing[3]}px`,
              border: 'none',
              background: 'transparent',
              color: 'var(--system-blue, #007AFF)',
              fontSize: fontSize.body.size,
              fontWeight: fontWeight.semibold,
              fontFamily: 'inherit',
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.4 : 1,
            }}
          >
            Done
          </button>
        </div>

        {/* Wheels */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: spacing[3],
            overflow: 'hidden',
          }}
        >
          <DatePickerWheel wheels={wheels} onChange={onChange} disabled={disabled} />
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Wheel Data Types
 */
interface WheelData {
  id: string;
  label: string;
  values: WheelValue[];
  selectedIndex: number;
  onChange: (index: number) => void;
}

interface WheelValue {
  value: number | string;
  label: string;
}

/**
 * Date Picker Wheel Component
 */
interface DatePickerWheelProps {
  wheels: WheelData[];
  onChange: (date: Date) => void;
  disabled?: boolean;
}

const DatePickerWheel = ({ wheels, onChange, disabled }: DatePickerWheelProps) => {
  const [wheelStates, setWheelStates] = useState<Record<string, number>>({});

  // Initialize wheel states
  useEffect(() => {
    const initialStates: Record<string, number> = {};
    wheels.forEach((wheel) => {
      initialStates[wheel.id] = wheel.selectedIndex;
    });
    setWheelStates(initialStates);
  }, [wheels]);

  const handleWheelChange = useCallback((wheelId: string, newIndex: number) => {
    setWheelStates((prev) => {
      const newStates = { ...prev, [wheelId]: newIndex };

      // Reconstruct date from all wheels
      const newDate = reconstructDateFromWheels(wheels, newStates);
      if (newDate) {
        onChange(newDate);
      }

      return newStates;
    });
  }, [wheels, onChange]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
      }}
    >
      {wheels.map((wheel) => (
        <PickerWheel
          key={wheel.id}
          wheel={wheel}
          currentIndex={wheelStates[wheel.id] ?? wheel.selectedIndex}
          onChange={(index) => handleWheelChange(wheel.id, index)}
          disabled={disabled}
        />
      ))}
    </div>
  );
};

/**
 * Individual Picker Wheel
 */
interface PickerWheelProps {
  wheel: WheelData;
  currentIndex: number;
  onChange: (index: number) => void;
  disabled?: boolean;
}

const PickerWheel = ({ wheel, currentIndex, onChange, disabled }: PickerWheelProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 36;
  const visibleItems = 5;
  const containerHeight = itemHeight * visibleItems;

  const dragY = useMotionValue(0);
  const springY = useSpring(dragY, {
    stiffness: 400,
    damping: 30,
    restDelta: 0.1,
  });

  // Calculate initial offset for centering selected item
  const initialOffset = -currentIndex * itemHeight + (containerHeight - itemHeight) / 2;

  // Set initial position
  useEffect(() => {
    dragY.set(initialOffset);
  }, [initialOffset, dragY]);

  const maxDrag = -(wheel.values.length - 1) * itemHeight + (containerHeight - itemHeight) / 2;
  const minDrag = (containerHeight - itemHeight) / 2;

  const handleDragEnd = (_event: any, info: { velocity: { y: number }; offset: { y: number } }) => {
    const velocity = info.velocity.y;
    const dragDistance = info.offset.y;
    let targetIndex = currentIndex;

    // Calculate target index based on drag distance
    const indexChange = Math.round(-dragDistance / itemHeight);
    targetIndex = Math.max(0, Math.min(wheel.values.length - 1, currentIndex + indexChange));

    // Adjust for velocity
    if (Math.abs(velocity) > 500) {
      const velocityIndexChange = Math.sign(velocity) * Math.min(Math.ceil(Math.abs(velocity) / 1000), 3);
      targetIndex = Math.max(0, Math.min(wheel.values.length - 1, targetIndex + velocityIndexChange));
    }

    const targetY = -targetIndex * itemHeight + (containerHeight - itemHeight) / 2;
    dragY.set(targetY);
    onChange(targetIndex);
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        height: containerHeight,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Gradient mask overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          background: `
            linear-gradient(
              to bottom,
              var(--system-background, #FFFFFF) 0%,
              var(--system-background, #FFFFFF) 30%,
              transparent 50%,
              transparent 50%,
              var(--system-background, #FFFFFF) 70%,
              var(--system-background, #FFFFFF) 100%
            )
          `,
          zIndex: 10,
        }}
      />

      {/* Selection indicator */}
      <div
        style={{
          position: 'absolute',
          top: (containerHeight - itemHeight) / 2,
          left: 0,
          right: 0,
          height: itemHeight,
          borderTop: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
          borderBottom: `1px solid var(--separator-non-opaque, ${colors.separator.nonOpaque})`,
          backgroundColor: 'var(--fill-tertiary, #00000033)',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Wheel values */}
      <motion.div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transformOrigin: 'center center',
          touchAction: 'pan-y',
          y: springY,
        }}
        drag="y"
        dragConstraints={{ top: maxDrag, bottom: minDrag }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
      >
        {wheel.values.map((value, index) => (
          <div
            key={value.value}
            style={{
              height: itemHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '80px',
              padding: `0 ${spacing[3]}px`,
              fontSize: index === currentIndex ? fontSize.title3.size : fontSize.body.size,
              lineHeight: index === currentIndex ? fontSize.title3.lineHeight : fontSize.body.lineHeight,
              letterSpacing: index === currentIndex ? fontSize.title3.letterSpacing : fontSize.body.letterSpacing,
              fontWeight: index === currentIndex ? fontWeight.semibold : fontWeight.regular,
              color: index === currentIndex
                ? 'var(--label-primary, #000000)'
                : 'var(--label-secondary, #3C3C43)',
              fontFamily: 'inherit',
              opacity: index === currentIndex ? 1 : 0.6,
              transform: index === currentIndex ? 'scale(1.1)' : 'scale(1)',
              transition: 'all 150ms cubic-bezier(0.17, 0.67, 0.5, 1)',
              cursor: disabled ? 'not-allowed' : 'default',
              userSelect: 'none',
            }}
          >
            {value.label}
          </div>
        ))}
      </motion.div>

      {/* Wheel label */}
      <div
        style={{
          position: 'absolute',
          bottom: -spacing[4],
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: fontSize.caption1.size,
          fontWeight: fontWeight.medium,
          color: 'var(--label-tertiary, #3C3C4399)',
          fontFamily: 'inherit',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {wheel.label}
      </div>
    </div>
  );
};

/**
 * Helper functions to generate wheel data
 */
function generateDateWheels(
  date: Date,
  min: Date,
  max: Date,
  locale: string
): WheelData[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const minYear = min.getFullYear();
  const maxYear = max.getFullYear();

  // Year wheel
  const years: WheelValue[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push({ value: y, label: y.toString() });
  }

  // Month wheel
  const months: WheelValue[] = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(2000, m, 1);
    months.push({
      value: m,
      label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(d),
    });
  }

  // Day wheel (depends on month/year)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: WheelValue[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ value: d, label: d.toString().padStart(2, '0') });
  }

  return [
    {
      id: 'month',
      label: 'Month',
      values: months,
      selectedIndex: month,
      onChange: () => {},
    },
    {
      id: 'day',
      label: 'Day',
      values: days,
      selectedIndex: day - 1,
      onChange: () => {},
    },
    {
      id: 'year',
      label: 'Year',
      values: years,
      selectedIndex: year - minYear,
      onChange: () => {},
    },
  ];
}

function generateTimeWheels(
  date: Date,
  minuteInterval: number,
  _locale: string
): WheelData[] {
  const hours = date.getHours();
  const minutes = date.getMinutes();

  // Hour wheel (12-hour format with AM/PM)
  const hourValues: WheelValue[] = [];
  for (let h = 1; h <= 12; h++) {
    hourValues.push({ value: h, label: h.toString() });
  }

  // Minute wheel
  const minuteValues: WheelValue[] = [];
  for (let m = 0; m < 60; m += minuteInterval) {
    minuteValues.push({ value: m, label: m.toString().padStart(2, '0') });
  }

  // AM/PM wheel
  const amPmValues: WheelValue[] = [
    { value: 'AM', label: 'AM' },
    { value: 'PM', label: 'PM' },
  ];

  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;

  return [
    {
      id: 'hour',
      label: 'Hour',
      values: hourValues,
      selectedIndex: displayHour - 1,
      onChange: () => {},
    },
    {
      id: 'minute',
      label: 'Minute',
      values: minuteValues,
      selectedIndex: Math.floor(minutes / minuteInterval),
      onChange: () => {},
    },
    {
      id: 'ampm',
      label: 'Period',
      values: amPmValues,
      selectedIndex: isPM ? 1 : 0,
      onChange: () => {},
    },
  ];
}

function generateDateTimeWheels(
  date: Date,
  min: Date,
  max: Date,
  minuteInterval: number,
  locale: string
): WheelData[] {
  const dateWheels = generateDateWheels(date, min, max, locale);
  const timeWheels = generateTimeWheels(date, minuteInterval, locale);

  return [...dateWheels, ...timeWheels];
}

function generateMonthWheels(
  date: Date,
  min: Date,
  max: Date,
  _locale: string
): WheelData[] {
  const year = date.getFullYear();
  const month = date.getMonth();

  const minYear = min.getFullYear();
  const maxYear = max.getFullYear();

  const years: WheelValue[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push({ value: y, label: y.toString() });
  }

  const months: WheelValue[] = [];
  for (let m = 0; m < 12; m++) {
    const d = new Date(2000, m, 1);
    months.push({
      value: m,
      label: new Intl.DateTimeFormat(_locale, { month: 'long' }).format(d),
    });
  }

  return [
    {
      id: 'month',
      label: 'Month',
      values: months,
      selectedIndex: month,
      onChange: () => {},
    },
    {
      id: 'year',
      label: 'Year',
      values: years,
      selectedIndex: year - minYear,
      onChange: () => {},
    },
  ];
}

function generateYearWheels(
  date: Date,
  min: Date,
  max: Date,
  _locale: string
): WheelData[] {
  const year = date.getFullYear();

  const minYear = min.getFullYear();
  const maxYear = max.getFullYear();

  const years: WheelValue[] = [];
  for (let y = minYear; y <= maxYear; y++) {
    years.push({ value: y, label: y.toString() });
  }

  return [
    {
      id: 'year',
      label: 'Year',
      values: years,
      selectedIndex: year - minYear,
      onChange: () => {},
    },
  ];
}

function reconstructDateFromWheels(wheels: WheelData[], states: Record<string, number>): Date | null {
  const values: Record<string, number | string> = {};
  wheels.forEach((wheel) => {
    const index = states[wheel.id] ?? wheel.selectedIndex;
    if (index >= 0 && index < wheel.values.length) {
      values[wheel.id] = wheel.values[index].value;
    }
  });

  try {
    const now = new Date();

    if (values.year !== undefined && values.month !== undefined && values.day !== undefined) {
      // Date or DateTime
      const year = Number(values.year);
      const month = Number(values.month);
      const day = Number(values.day);
      const hour = values.hour !== undefined ? Number(values.hour) : now.getHours();
      const minute = values.minute !== undefined ? Number(values.minute) : now.getMinutes();
      const ampm = values.ampm as string | undefined;

      let finalHour = hour;
      if (ampm === 'PM' && hour !== 12) finalHour += 12;
      if (ampm === 'AM' && hour === 12) finalHour = 0;

      return new Date(year, month, day, finalHour, minute);
    }

    if (values.year !== undefined && values.month !== undefined) {
      // Month/Year
      return new Date(Number(values.year), Number(values.month), 1);
    }

    if (values.year !== undefined) {
      // Year only
      return new Date(Number(values.year), 0, 1);
    }

    if (values.hour !== undefined && values.minute !== undefined) {
      // Time only
      const hour = Number(values.hour);
      const minute = Number(values.minute);
      const ampm = values.ampm as string | undefined;

      let finalHour = hour;
      if (ampm === 'PM' && hour !== 12) finalHour += 12;
      if (ampm === 'AM' && hour === 12) finalHour = 0;

      const date = new Date();
      date.setHours(finalHour, minute, 0, 0);
      return date;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Standalone Date Picker Wheel (for inline use)
 */
export interface StandaloneDatePickerProps {
  /** Selected date */
  value?: Date;
  /** Change handler */
  onChange?: (date: Date) => void;
  /** Minimum date */
  minDate?: Date;
  /** Maximum date */
  maxDate?: Date;
  /** Picker mode */
  mode?: 'date' | 'time' | 'datetime' | 'month' | 'year';
  /** Locale */
  locale?: string;
  /** Minute interval */
  minuteInterval?: 1 | 5 | 10 | 15 | 30;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Custom style */
  style?: React.CSSProperties;
}

export const StandaloneDatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  mode = 'date',
  locale = 'en-US',
  minuteInterval = 1,
  disabled = false,
  className = '',
  style,
}: StandaloneDatePickerProps) => {
  const [internalValue, setInternalValue] = useState<Date | null>(value ?? null);
  const currentValue = value !== undefined ? value : internalValue;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const wheelData = useMemo(() => {
    const now = currentValue || new Date();
    const min = minDate || new Date(1900, 0, 1);
    const max = maxDate || new Date(2100, 11, 31);

    switch (mode) {
      case 'date':
        return generateDateWheels(now, min, max, locale);
      case 'time':
        return generateTimeWheels(now, minuteInterval, locale);
      case 'datetime':
        return generateDateTimeWheels(now, min, max, minuteInterval, locale);
      case 'month':
        return generateMonthWheels(now, min, max, locale);
      case 'year':
        return generateYearWheels(now, min, max, locale);
      default:
        return generateDateWheels(now, min, max, locale);
    }
  }, [currentValue, minDate, maxDate, mode, locale, minuteInterval]);

  const handleChange = useCallback((date: Date) => {
    if (value === undefined) {
      setInternalValue(date);
    }
    onChange?.(date);
  }, [onChange, value]);

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: spacing[3],
        ...style,
      }}
    >
      <DatePickerWheel wheels={wheelData} onChange={handleChange} disabled={disabled} />
    </div>
  );
};

StandaloneDatePicker.displayName = 'StandaloneDatePicker';