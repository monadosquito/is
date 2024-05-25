import { MonthInterval, MonthWorkingHours } from "@core/Day";


interface ICalendarRepository {
    addMonthWorkingHours: (
        monthedWorkingHours: MonthWorkingHours
    ) => Promise<void>
    getWorkingHours: (interval: MonthInterval) => Promise<MonthWorkingHours[]>
    isHoliday: (date: Date) => Promise<boolean>
    isWeekendWorking: (date: Date) => Promise<boolean>
    cleanMonthWorkingHours: () => Promise<void>
    clean: () => Promise<void>
    list: () => Promise<MonthWorkingHours[]>
}


export type { ICalendarRepository }
