// Calendar component - not used in this Bible app
// Re-exporting from react-day-picker to avoid TypeScript issues
import * as React from "react";
import { DayPicker } from 'react-day-picker';

export { DayPicker as Calendar };
export type CalendarProps = React.ComponentProps<typeof DayPicker>;
