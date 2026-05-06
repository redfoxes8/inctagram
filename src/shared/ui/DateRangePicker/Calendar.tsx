import { DayPicker } from "react-day-picker"
import { enUS } from "date-fns/locale"
import s from "./DateRangePicker.module.css"
import { Icon } from "../Icon"

export const Calendar = ({ mode, selected, onSelect, disabled }: any) => {
  const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6

  return (
    <DayPicker
      navLayout="after"
      fixedWeeks
      mode={mode}
      selected={selected}
      onSelect={onSelect}
      locale={enUS}
      weekStartsOn={1}
      showOutsideDays={true}
      autoFocus
      disabled={disabled}
      className={s.calendar}
      modifiers={{ weekend: isWeekend }}
      modifiersClassNames={{
        selected: s.selectedDay,
        range_start: s.rangeStart,
        range_end: s.rangeEnd,
        range_middle: s.rangeMiddle,
        weekend: s.weekend,
      }}
      components={{
        Chevron: ({ orientation }) => (
          <Icon name={orientation === "left" ? "arrow-ios-back" : "arrow-ios-forward"} className={s.customChevron} />
        ),
      }}
    />
  )
}
